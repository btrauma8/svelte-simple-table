<script>
    import { setContext, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    import { update } from './table';

    export let data = [];
    export let filter = '';
    export let filterFields = [];
    export let rowsPerPage = 10;
    export let maxPageButtons = 9;
    export let sortIconCss = '';
    export let sortIconAscCss = '';
    export let sortIconDescCss = '';
    export let initPage = 0;
    export let initSort = undefined;
    export let onChange = () => {};
    

    const tableStore = writable();
    setContext('svelte-simple-table', tableStore);
    const unsub = tableStore.subscribe(x => onChange(x));
    onDestroy(() => unsub());

    $: {
        update(
            tableStore,
            data,
            filter,
            filterFields,
            rowsPerPage*1,
            maxPageButtons*1,
            sortIconCss,
            sortIconAscCss,
            sortIconDescCss,
            initSort,
            initPage*1
        );
    }

</script>

<slot table={$tableStore}></slot>

