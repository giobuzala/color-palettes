<script>
    export let options = [];
    export let value;
    export let label = '';

    const id = Math.round(Math.random() * 1e7).toString(36);
    $: options2 = options.map(s => (typeof s === 'string' ? { value: s, title: s } : s));
</script>

<style>
	.seg-group {
		display: inline-flex;
		background: #f3f4f6;
		border-radius: 999px;
		padding: 3px;
	}
	.seg-btn {
		display: inline-block;
		padding: 0.3rem 0.85rem;
		border-radius: 999px;
		border: none;
		background: transparent;
		color: #6b7280;
		font-size: 0.88rem;
		font-weight: 500;
		cursor: pointer;
		margin: 0;
		line-height: 1.4;
	}
	.seg-btn.active {
		background: #fff;
		color: #1f2937;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		font-weight: 600;
	}
	.seg-btn input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
</style>

<div class="seg-group">
    {#each options2 as option}
        <label class="seg-btn" class:active={value === option.value}>
            <input
                bind:group={value}
                value={option.value}
                type="radio"
                name={id}
                id={`${id}-${option.value}`}
                autocomplete="off"
                checked={value === option.value} />
            {option.title}
        </label>
    {/each}
</div>
