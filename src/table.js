var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var passesFilter = function (f, row, filterFields) {
    if (!f)
        return true;
    for (var i = 0; i < filterFields.length; i++) {
        var fld = filterFields[i];
        var v = getDotNotationValue(row, fld);
        if (String(v).toLowerCase().indexOf(f) > -1)
            return true;
    }
    return false;
};
var getFilteredRows = function (rows, filter, filterFields) {
    if (!filter)
        return rows;
    var f = filter.toLowerCase();
    return rows.filter(function (row) { return passesFilter(f, row, filterFields); });
};
export var setSort = function (store, by, asc, opts) {
    var sort = {
        by: by,
        asc: asc,
        asDate: opts.asDate,
        caseSensitive: opts.caseSensitive
    };
    store.update(function (data) {
        var rows = getSortedRows(getFilteredRows(data.rows, data.filter, data.filterFields), sort);
        var result = __assign(__assign({}, data), { sortedAndFilteredRows: rows, paging: getPaging(store, data.paging, data.paging.currentPage, rows.length), pageRows: getPageRows(rows, data.paging.currentPage, data.paging.rowsPerPage), sorting: sort });
        return result;
    });
};
var setNewPage = function (store, state, n) {
    return __assign(__assign({}, state), { paging: getPaging(store, state.paging, n, state.sortedAndFilteredRows.length), pageRows: getPageRows(state.sortedAndFilteredRows, n, state.paging.rowsPerPage) });
};
var goBack = function (store) {
    store.update(function (state) {
        var n = state.paging.currentPage > 0 ? state.paging.currentPage - 1 : 0;
        return setNewPage(store, state, n);
    });
};
var goForward = function (store) {
    store.update(function (state) {
        var n = state.paging.currentPage < state.paging.pageCount - 1 ? state.paging.currentPage + 1 : state.paging.pageCount - 1;
        return setNewPage(store, state, n);
    });
};
var setPage = function (store, n) {
    store.update(function (state) { return setNewPage(store, state, n); });
};
var getPaging = function (store, paging, currentPage, filteredRowCount) {
    var pageCount = Math.ceil(filteredRowCount / paging.rowsPerPage);
    return __assign(__assign({}, paging), { pageCount: pageCount, currentPage: currentPage, buttons: getPageButtons(store, currentPage, paging.maxButtons, pageCount), onNext: function () { return goForward(store); }, onPrevious: function () { return goBack(store); } });
};
var getPageButtons = function (store, currentPage, maxButtons, pageCount) {
    if (pageCount === 0)
        return [];
    var btnCnt = (pageCount < maxButtons) ? pageCount : maxButtons;
    var buttons = [];
    buttons.push({
        active: true,
        label: (currentPage + 1) + '',
        onClick: function () { }
    });
    var beforeIndex = currentPage;
    var afterIndex = currentPage;
    var getOnClick = function (store, n) {
        return function () { return setPage(store, n); };
    };
    while (buttons.length < btnCnt) {
        beforeIndex--;
        if (beforeIndex >= 0) {
            buttons.unshift({
                active: false,
                label: (beforeIndex + 1) + '',
                onClick: getOnClick(store, beforeIndex)
            });
        }
        // check again...
        if (buttons.length < btnCnt) {
            afterIndex++;
            if (afterIndex < pageCount) {
                buttons.push({
                    active: false,
                    label: (afterIndex + 1) + '',
                    onClick: getOnClick(store, afterIndex)
                });
            }
        }
    }
    return buttons;
};
var getPageRows = function (rows, page, rowsPerPage) {
    // Take rows, and now apply paging to it.
    if (!rowsPerPage)
        return rows; // no paging
    var startIndex = page * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    if (endIndex > rows.length)
        endIndex = rows.length;
    return rows.slice(startIndex, endIndex);
};
// const getPagingOnUpdate = (state:TableStoreData, maxPageButtons:number, rowsPerPage:number, currentPage:number):TablePaging => {
//     return {
//     }
// }
export var update = function (store, rows, filter, filterFields, rowsPerPage, maxPageButtons, sortIconCss, sortIconAscCss, sortIconDescCss, sorting, initPage) {
    // This is called:
    // -once initially
    // -every time underlying rows (not filtered/sorted/paged rows) are cahanged
    // -every time filter is changed (they type in a letter, boom, this is called)
    // -any odd ball cases where filterFields or sort classes change (this is unlikely)
    store.update(function (x) {
        // Question: When do we want to send the user back to page 0?
        // for now, when filter text changes OR underlying rows change
        var goBackToZero = (x && x.rows !== rows) || (x && x.filter !== filter);
        var currentPage = goBackToZero ? 0 : x ? x.paging.currentPage : initPage;
        var sort = x ? x.sorting : sorting;
        // TODO: if user changes maxPageButtons or rowsPerPage, we should handle that.
        // we do not. imagine browser resizing down, for example.
        var currentPaging = x ? x.paging : {
            buttons: [],
            currentPage: currentPage,
            maxButtons: maxPageButtons,
            onNext: function () { },
            onPrevious: function () { },
            pageCount: 0,
            rowsPerPage: rowsPerPage
        };
        var filteredRows = getSortedRows(getFilteredRows(rows, filter, filterFields), sort);
        var result = {
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
};
var getSortedRows = function (rows, sort) {
    if (!sort)
        return rows; // nothing
    return __spreadArrays(rows).sort(function (a, b) {
        var v1 = sortVal(a, sort);
        var v2 = sortVal(b, sort);
        if (v1 < v2)
            return sort.asc ? -1 : 1;
        if (v1 > v2)
            return sort.asc ? 1 : -1;
        return 0;
    });
};
var sortVal = function (x, sort) {
    if (!sort || !sort.by) {
        alert(JSON.stringify(sort));
        throw 'why are we sorting? no sort!';
    }
    if (typeof sort.by === 'string') {
        var v = getDotNotationValue(x, sort.by);
        if (sort.asDate) {
            try {
                return (new Date(v)).getTime();
            }
            catch (err) {
                return 0;
            }
        }
        if (sort.asNumber)
            return v * 1; // "09" vs "9" for example
        if (typeof v !== 'string')
            return v;
        if (sort.caseSensitive)
            return v;
        return String(v).toLowerCase();
    }
    else if (typeof sort.by === 'function') {
        // They supplied their own sort value getter
        return sort.by(x);
    }
    return null;
};
var getDotNotationValue = function (obj, path) {
    if (obj.hasOwnProperty(path))
        return obj[path]; // most the time, this will be the guy.
    // Deal with dot notation!
    // If they send "a.b.c" we must find that nested value and return it!
    var arr = path.split('.');
    if (arr.length == 0)
        return null;
    var o = obj;
    for (var i = 0; i < arr.length - 1; i++) {
        if (!o.hasOwnProperty(arr[i]))
            return null;
        o = o[arr[i]];
    }
    if (!o.hasOwnProperty(arr[arr.length - 1]))
        return null;
    return o[arr[arr.length - 1]];
};
