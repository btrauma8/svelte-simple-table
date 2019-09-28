Demo: http://jeffbot.org/svtable/

npm name is svelte-simple-table

...more documentation is coming soon...

but easiest thing is just check out examples folder.
I like this approach more than a big config object being defined.
You can look right at html and see everything.
The magic is the let:table, it gives the template below it all the stuff it  needs.

### What it does

- Turn svelte tables into filterable sortable pagable tables in a nice declarative way.

### What it does not do
- server side callbacks for paging stuff.

### script looks like this
    import { MakeSortable, SortLink, SortHeader } from '../../makeSortable';
	// only difference between SortLink and SortHeader is one is a th and one a div.
### Html looks like this

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
			<ul class="pagination">
				<li class="page-item" class:disabled={table.paging.currentPage === 0}>
					<button class="page-link" on:click={table.paging.onPrevious}>Previous</button>
				</li>
				{#each table.paging.buttons as btn (btn)}
					<li class="page-item" class:active={btn.active}>
						<button class="page-link" on:click={btn.onClick}>{btn.label}</button>
					</li>
				{/each} 
				<li class="page-item" class:disabled={table.paging.currentPage >= table.paging.pageCount-1}>
					<button class="page-link" on:click={table.paging.onNext}>Next</button>
				</li>
			</ul>
		</MakeSortable>
    
	
### pkg.svelte looks like this:
{
  "name": "svelte-simple-table",
  "svelte": "src/index.js"
}

