<script>
    export let table;
</script>

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