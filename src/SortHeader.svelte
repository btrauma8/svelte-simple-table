<script>
    import { getContext, onDestroy } from 'svelte';
    import { setSort } from './table';
    export let path;
    export let caseSensitive = undefined;
    export let asDate = undefined;
    export let asNumber = undefined;
    export let useSlots = false;

    const tableStore = getContext('svelte-simple-table');

    let sortedAsc = false;
    let sortedDesc = false;
    let state;

    const unsub = tableStore.subscribe(x => state = x);
    onDestroy(() => unsub());

    $: {
       // If state changes, update if we are sorted or not.
        if (state && state.sorting && state.sorting.by === path) {
            sortedAsc = state.sorting.asc;
            sortedDesc = !state.sorting.asc;
        } else {
            sortedAsc = false;
            sortedDesc = false;
        }
    }

    const sort = () => {
        const sortOpts = {
            caseSensitive: caseSensitive,
            asDate: asDate,
            asNumber: asNumber
        };
        setSort(tableStore, path, !sortedAsc, sortOpts);
    }

</script>

<th on:click={sort}>
    <slot></slot>
    {#if useSlots}
        {#if !sortedAsc && !sortedDesc}<slot name="sort"></slot>{/if}
        {#if sortedAsc }<slot name="sortAsc"></slot>{/if}
        {#if sortedDesc}<slot name="sortDesc"></slot>{/if}
    {:else}
        {#if !sortedAsc && !sortedDesc && state.sortIconCss}<i class={state.sortIconCss}></i>{/if}
        {#if sortedAsc && state.sortIconAscCss}<i class={state.sortIconAscCss}></i>{/if}
        {#if sortedDesc && state.sortIconDescCss}<i class={state.sortIconDescCss}></i>{/if}
    {/if}
</th>
