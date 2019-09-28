type TableSortBy = string | ((x:any) => any);

interface TableStoreData {
    readonly rows:Array<any>;
    readonly sortedAndFilteredRows:Array<any>;
    readonly pageRows:Array<any>;

    readonly sorting:TableSorting;
    //readonly sortAsc:boolean;
    //readonly sortBy:TableSortBy;
    //readonly sortOpts:TableSortOpts;
    readonly sortIconCss:string;
    readonly sortIconAscCss:string;
    readonly sortIconDescCss:string;
    readonly paging:TablePaging;
    readonly filter:string;
    readonly filterFields:Array<string>;
}

interface TableSorting {
    readonly asc:boolean;
    readonly by:TableSortBy;
    readonly caseSensitive?:boolean;
    readonly asDate?:boolean;
    readonly asNumber?:boolean;
}

interface TablePaging {
    readonly maxButtons:number;
    readonly pageCount:number;
    readonly rowsPerPage:number;
    readonly currentPage:number;
    readonly buttons:Array<PagerButton>;
    readonly onNext:() => any;
    readonly onPrevious:() => any;
}

interface PagerButton {
    readonly active:boolean;
    readonly label:string;
    readonly onClick:(n:number) => any;
}
interface TableSortOpts {
    readonly caseSensitive:boolean;
    readonly asDate:boolean;
}

const passesFilter = (f:string, row:any, filterFields:Array<string>) => {
    if (!f) return true;
    for (let i=0; i < filterFields.length; i++) {
        let fld = filterFields[i];
        let v:any = getDotNotationValue(row, fld);
        if (String(v).toLowerCase().indexOf(f) > -1) return true;
    }
    return false;
}

const getFilteredRows = (rows:Array<any>, filter:string, filterFields:Array<string>):Array<any> => {
    if (!filter) return rows;
    let f = filter.toLowerCase();
    return rows.filter(row => passesFilter(f, row, filterFields));
}

export const setSort = (store:any, by:TableSortBy, asc:boolean, opts:any) => {
    const sort:TableSorting = {
        by: by,
        asc: asc,
        asDate: opts.asDate,
        caseSensitive: opts.caseSensitive
    }
    store.update((data:TableStoreData) => {
        const rows = getSortedRows(getFilteredRows(data.rows, data.filter, data.filterFields), sort);
        const result:TableStoreData ={
            ...data,
            sortedAndFilteredRows: rows,
            paging: getPaging(store, data.paging, data.paging.currentPage, rows.length),
            pageRows: getPageRows(rows, data.paging.currentPage, data.paging.rowsPerPage),
            sorting: sort
        }
        return result;
    });
}

const setNewPage = (store:any, state:TableStoreData, n:number):TableStoreData => {
    return {
        ...state,
        paging: getPaging(store, state.paging, n, state.sortedAndFilteredRows.length),
        pageRows: getPageRows(state.sortedAndFilteredRows, n, state.paging.rowsPerPage)
    }
}

const goBack = (store:any) => {
    store.update((state:TableStoreData) => {
        const n = state.paging.currentPage > 0 ? state.paging.currentPage - 1 : 0;
        return setNewPage(store, state, n);
    });
}

const goForward = (store:any) => {
    store.update((state:TableStoreData) => {
        const n = state.paging.currentPage < state.paging.pageCount-1 ? state.paging.currentPage+1 : state.paging.pageCount-1;
        return setNewPage(store, state, n);
    });
}

const setPage = (store:any, n:number) => {
    store.update((state:TableStoreData) => setNewPage(store, state, n));
}

const getPaging = (store:any, paging:TablePaging, currentPage:number, filteredRowCount:number):TablePaging => {
    const pageCount = Math.ceil(filteredRowCount / paging.rowsPerPage);
    return {
        ...paging,
        pageCount: pageCount,
        currentPage: currentPage,
        buttons: getPageButtons(store, currentPage, paging.maxButtons, pageCount),
        onNext: () => goForward(store),
        onPrevious: () => goBack(store)
    }
}

const getPageButtons = (store:any, currentPage:number, maxButtons:number, pageCount:number):Array<PagerButton> => {

    if (pageCount === 0) return [];
    const btnCnt = (pageCount < maxButtons) ? pageCount : maxButtons;

    const buttons:Array<PagerButton> = [];
    buttons.push({
        active: true,
        label: (currentPage+1)+'',
        onClick: () => {}
    });

    let beforeIndex = currentPage;
    let afterIndex = currentPage;

    const getOnClick = (store:any, n:number) => {
        return () => setPage(store, n);
    }

    while (buttons.length < btnCnt) {
        beforeIndex--;
        if (beforeIndex >= 0) {
            buttons.unshift({
                active: false,
                label: (beforeIndex+1)+'',
                onClick: getOnClick(store, beforeIndex)
            });
        }
        // check again...
        if (buttons.length < btnCnt) {
            afterIndex++;
            if (afterIndex < pageCount) {
                buttons.push({
                    active: false,
                    label: (afterIndex+1)+'',
                    onClick: getOnClick(store, afterIndex)
                });
            }
        }
    }
    return buttons;
}


const getPageRows = (rows:Array<any>, page:number, rowsPerPage:number) => {
    // Take rows, and now apply paging to it.
    if (!rowsPerPage) return rows; // no paging
    const startIndex = page * rowsPerPage;
    let endIndex = startIndex + rowsPerPage;
    if (endIndex > rows.length) endIndex = rows.length;
    return rows.slice(startIndex, endIndex);
}

// const getPagingOnUpdate = (state:TableStoreData, maxPageButtons:number, rowsPerPage:number, currentPage:number):TablePaging => {
//     return {

//     }


// }

export const update = (
    store:any,
    rows:Array<any>,
    filter:string,
    filterFields:Array<string>,
    rowsPerPage:number,
    maxPageButtons:number,
    sortIconCss:string,
    sortIconAscCss:string,
    sortIconDescCss:string,
    sorting:TableSorting,
    initPage:number
) => {
    // This is called:
    // -once initially
    // -every time underlying rows (not filtered/sorted/paged rows) are cahanged
    // -every time filter is changed (they type in a letter, boom, this is called)
    // -any odd ball cases where filterFields or sort classes change (this is unlikely)

    store.update((x:TableStoreData) => {
        // Question: When do we want to send the user back to page 0?
        // for now, when filter text changes OR underlying rows change
        const goBackToZero = (x && x.rows !== rows) || (x && x.filter !== filter);
        const currentPage = goBackToZero ? 0 : x ? x.paging.currentPage : initPage;
        const sort:TableSorting = x ? x.sorting : sorting;

        // TODO: if user changes maxPageButtons or rowsPerPage, we should handle that.
        // we do not. imagine browser resizing down, for example.
        const currentPaging:TablePaging = x ? x.paging : {
            buttons: [],
            currentPage: currentPage,
            maxButtons: maxPageButtons,
            onNext: () => {},
            onPrevious: () => {},
            pageCount: 0,
            rowsPerPage: rowsPerPage
        }
        
        
        const filteredRows = getSortedRows(getFilteredRows(rows, filter, filterFields), sort);

        const result:TableStoreData = {
            // sortAsc: x ? x.sortAsc : true,
            // sortBy: x ? x.sortBy : '',
            // sortOpts: sortOpts,
            sorting: sort,
            rows: rows,
            sortedAndFilteredRows: filteredRows,
            pageRows: getPageRows(filteredRows, currentPage, rowsPerPage),
            sortIconCss: sortIconCss,
            sortIconAscCss: sortIconAscCss,
            sortIconDescCss: sortIconDescCss,
            filter: filter,
            filterFields: filterFields,
            paging: getPaging(store, currentPaging, currentPage, filteredRows.length)
        };
        return result;
    });

}

const getSortedRows = (rows:Array<any>, sort:TableSorting):Array<any> => {
    if (!sort) return rows; // nothing
    return [...rows].sort((a,b) => {
        const v1 = sortVal(a, sort);
        const v2 = sortVal(b, sort);
        if (v1 < v2) return sort.asc ? -1 : 1;
        if (v1 > v2) return sort.asc ? 1 : -1;
        return 0;
    }); 
}

const sortVal = (x:any, sort:TableSorting):any => {
    if (!sort || !sort.by) {
        alert(JSON.stringify(sort));
        throw 'why are we sorting? no sort!';
    }
    if (typeof sort.by === 'string') {
        let v = getDotNotationValue(x, sort.by);
        if (sort.asDate) {
            try {
                return (new Date(v)).getTime();
            } catch(err) {
                return 0;
            }
        }
        if (sort.asNumber) return v*1; // "09" vs "9" for example
        if (typeof v !== 'string') return v;
        if (sort.caseSensitive) return v;
        return String(v).toLowerCase();
    } else if (typeof sort.by === 'function') {
        // They supplied their own sort value getter
        return sort.by(x);
    }
    return null;
}


const getDotNotationValue = (obj:any, path:string) => {
    if (obj.hasOwnProperty(path)) return obj[path]; // most the time, this will be the guy.
    // Deal with dot notation!
    // If they send "a.b.c" we must find that nested value and return it!
    let arr = path.split('.');
    if (arr.length == 0) return null;
    let o = obj;
    for (var i=0; i < arr.length-1; i++) {
        if (!o.hasOwnProperty(arr[i])) return null;
        o = o[arr[i]];
    }
    if (!o.hasOwnProperty(arr[arr.length-1])) return null;
    return o[arr[arr.length-1]];
}