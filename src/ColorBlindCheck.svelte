<script>
    import { colorBlindCheck } from './colorBlind';

    $: result = colorBlindCheck(colors);

    export let colors = [];
    export let active = 'none';

    const types = ['none', 'deuteranopia', 'protanopia', 'tritanopia'];
    const typeTitles = {
        none: 'Normal vision',
        deuteranopia: 'Deuteranopia',
        protanopia: 'Protanopia',
        tritanopia: 'Tritanopia'
    };
</script>

<style>
@media (min-width: 720px) {
    .colorblind-sim {
        text-align: right;
        position: absolute;
        right: 20px;
        top: -34px;
    }
    .res {
        text-align: right;
    }
}

.res {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    margin: 0 0 8px;
    font-size: 0.9rem;
    font-weight: 600;
}

.sim-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.sim-label {
    color: #6b7280;
    font-size: 0.85rem;
    font-weight: 600;
}

.seg-group {
    display: inline-flex;
    background: #f3f4f6;
    border-radius: 999px;
    padding: 3px;
}
.seg-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.26rem 0.6rem;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: #6b7280;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    margin: 0;
    line-height: 1.4;
    user-select: none;
}
.seg-btn.active {
    background: #fff;
    color: #1f2937;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.seg-btn.danger.active {
    background: #fff;
    color: #b91c1c;
}
.seg-btn input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

</style>

<div class="colorblind-sim">
    {#if result.length}
        <p class="res text-danger">Not colorblind-safe</p>
    {:else}
        <p class="res text-secondary">Colorblind-safe</p>
    {/if}
    <div class="sim-row">
        <div class="sim-label">simulate</div>
        <div class="seg-group" role="group" aria-label="Colorblind simulation">
            {#each types as type}
                <label
                    class="seg-btn"
                    class:danger={result.includes(type)}
                    class:active={active === type}
                    title={typeTitles[type]}>
                    <input
                        bind:group={active}
                        value={type}
                        type="radio"
                        name="cbSim"
                        autocomplete="off" />
                    {type === 'none' ? 'normal' : type.substr(0, 4) + '.'}
                </label>
            {/each}
        </div>
    </div>
</div>
