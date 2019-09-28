<script>
    import { MakeSortable, SortLink, SortHeader } from '../../makeSortable';
    import BsPager from './bsPager.svelte';
    import { items } from '../sampleData';
    let filter;
    const niceDate = (dt) => {
        if (!dt) return '';
        return (new Date(dt)).toLocaleString({ dateStyle: 'short'});
    }
</script>

<div class="container">

    <h3>svelte-simple-table</h3>
    <h5>A Bootstrap 4 with Font Awesome Example</h5>

    <div class="input-group mb-3" style="max-width:400px">
        <div class="input-group-prepend"><span class="input-group-text" id="basic-addon1">Filter</span></div>
        <input type="text" class="form-control" bind:value={filter} >
    </div>

    <MakeSortable
        data={items}
        let:table
        filter={filter}
        filterFields={['firstName', 'lastName', 'someNumber', 'address.city', 'address.state', 'dob']}
        sortIconCss="fa fa-sort"
        sortIconAscCss="fa fa-sort-asc"
        sortIconDescCss="fa fa-sort-desc"
    >
        Rows: { table.rows.length }<br />
        Filtered Rows: { table.sortedAndFilteredRows.length }<br />

        <table class="table table-sm">
            <thead class="thead-light">
                <tr>
                    <SortHeader path={(x) => x.firstName + ' ' + x.lastName}>Full Name</SortHeader>
                    <SortHeader path="firstName">First Name</SortHeader>
                    <SortHeader path="lastName">Last Name</SortHeader>
                    <SortHeader path="someNumber">Some Number</SortHeader>
                    <SortHeader path="address.city">City</SortHeader>
                    <SortHeader path="address.state">State</SortHeader>
                    <SortHeader path="dob" asDate>DOB</SortHeader>
                </tr>
            </thead>
            <tbody>
                {#each table.pageRows as row}
                    <tr>
                        <td>{ row.firstName } { row.lastName }</td>
                        <td>{ row.firstName }</td>
                        <td>{ row.lastName }</td>
                        <td>{ row.someNumber }</td>
                        <td>{ row.address.city }</td>
                        <td>{ row.address.state }</td>
                        <td>{ niceDate(row.dob) }</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <BsPager table={table} />
    </MakeSortable>

</div>