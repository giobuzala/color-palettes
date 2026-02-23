<script>
    import chroma from 'chroma-js';
    import { beforeUpdate } from 'svelte';
    import Checkbox from './Checkbox.svelte';
    import InputColors from './InputColors.svelte';
    import PalettePreview from './PalettePreview.svelte';
    import Export from './Export.svelte';
    import StepChart from './StepChart.svelte';
    import Card from './Card.svelte';
    import ColorBlindCheck from './ColorBlindCheck.svelte';
    import ButtonGroup from './ButtonGroup.svelte';
    import AIChatbot from './AIChatbot.svelte';

    let steps = [];
    let bezier = true;
    let correctLightness = true;

    let colors = '00429d,96ffea,ffffe0'.split(/\s*,\s*/).map(c => chroma(c));
    let colors2 = 'ffffe0,ff005e,93003a'.split(/\s*,\s*/).map(c => chroma(c));
    let numColors = 9;
    let mode = 'sequential';
    let simulate = 'none';

    if (window.location.hash) {
        readStateFromHash();
    }

    // URL hash encodes the current palette state for easy sharing/bookmarking.
    // Format: numColors|mode(s/d)|colors|colors2|correctLightness(0/1)|bezier(0/1)
    $: hash = [
        numColors,
        mode.substr(0, 1),
        colors.map(c => c.hex().substr(1)).join(','),
        colors2.length ? colors2.map(c => c.hex().substr(1)).join(',') : '',
        correctLightness ? 1 : 0,
        bezier ? 1 : 0
    ].join('|');

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') > -1;

    let _hash = '';
    let _mode = 'sequential';

    beforeUpdate(() => {
        if (hash !== _hash) {
            _hash = hash;
            window.location.hash = `#/${hash}`;
        }
        if (mode !== _mode) {
            if (mode === 'diverging' && !colors2.length) {
                colors2 = colors.slice(0).reverse();
            }
            _mode = mode;
        }
    });

    function readStateFromHash() {
        const parts = window.location.hash.substr(2).split('|');
        if (parts.length === 6) {
            setTimeout(() => {
                numColors = +parts[0];
                mode = parts[1] === 's' ? 'sequential' : 'diverging';
                _mode = mode;
                colors = parts[2].split(',').map(c => c && chroma(c));
                colors2 = parts[3] !== '' ? parts[3].split(',').map(c => c && chroma(c)) : [];
                correctLightness = parts[4] === '1';
                bezier = parts[5] === '1';
            });
        } else {
            window.location.hash = '';
        }
    }

    function hashChange() {
        if (window.location.hash !== `#/${hash}`) {
            // deserialize hash
            readStateFromHash();
        }
    }

    function normalizeHex(rawColor) {
        if (typeof rawColor !== 'string') return null;
        const trimmed = rawColor.trim();
        if (!trimmed) return null;
        return trimmed[0] === '#' ? trimmed : `#${trimmed}`;
    }

    function toChromaList(rawColors, fallback) {
        if (!Array.isArray(rawColors) || !rawColors.length) return fallback;
        const parsed = rawColors
            .map(normalizeHex)
            .filter(Boolean)
            .map(color => {
                try {
                    return chroma(color);
                } catch (e) {
                    return null;
                }
            })
            .filter(Boolean);
        return parsed.length ? parsed : fallback;
    }

    function handleApplyPalette(event) {
        const config = event && event.detail ? event.detail : {};

        if (config.mode === 'sequential' || config.mode === 'diverging') {
            mode = config.mode;
        }

        const parsedNumColors = Math.round(+config.numColors);
        if (isFinite(parsedNumColors) && parsedNumColors >= 2) {
            numColors = parsedNumColors;
        }

        if (typeof config.bezier === 'boolean') {
            bezier = config.bezier;
        }
        if (typeof config.correctLightness === 'boolean') {
            correctLightness = config.correctLightness;
        }

        colors = toChromaList(config.colors, colors);

        if (mode === 'diverging') {
            colors2 = toChromaList(config.colors2, colors2.length ? colors2 : colors.slice(0).reverse());
        } else {
            colors2 = [];
        }
    }
</script>

<style>
    .head {
        margin: 1.5em 0 1.8em;
    }
    .head p {
        color: #6b7280;
        font-size: 0.92rem;
        margin-bottom: 0;
    }
    select.custom-select {
        display: inline-block;
        width: auto;
        font-size: inherit;
        padding: 0.4em 1.7em 0.4em 0.4em;
        margin: 0px 0.7ex 5px;
    }
    .step1-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;
    }
    .step1-row .step1-field:first-child {
        flex: 0 0 55%;
    }
    .step1-field {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .step1-field .label-text {
        color: #4b5563;
        white-space: nowrap;
    }
    input[type=number] {
        width: 3.2em;
        text-align: center;
        margin: 0;
        border: 2px solid #d1d5db;
        border-radius: 8px;
        background: #fff;
        font-weight: 700;
        font-size: 0.98rem;
        padding: 0.4em 0.5em;
    }
    input[type=number]:focus {
        outline: none;
        border-color: #4b6cb7;
    }
    .foot {
        margin: 16px 0 0;
        padding-bottom: 20px;
    }
    .foot hr {
        border-color: #e5e7eb;
        margin: 0 0 10px;
    }
    .foot p {
        color: #4b5563;
        font-size: 0.9rem;
        margin: 0;
    }
    .foot a {
        color: #374151;
    }
    .foot a:hover {
        color: #111827;
    }
    kbd {
        background-color:#f3f4f6;
        border:1px solid #d1d5db;
        border-radius:4px;
        box-shadow:0 1px 0 rgba(0,0,0,0.08);
        color:#374151;
        display:inline-block;
        line-height:1.4;
        margin:0 .1em;
        padding:.1em .5em;
        font-size: 0.85em;
    }
    :global(.custom-control-label) {
        color: #4b5563;
        font-size: 0.93rem;
    }
</style>

<svelte:window on:hashchange={hashChange} />

<div class="container">
    <div class="head">
        <h1>Chroma.js Color Palette Helper</h1>
        <p>This <a href="https://github.com/gka/chroma.js" target="_blank">chroma.js</a>-powered tool is here to help us master <a href="https://www.vis4.net/blog/mastering-multi-hued-color-scales/" target="_blank">multi-hued, multi-stops color scales</a>, with a little help from AI.</p>
    </div>
    <Card step="1" title="What kind of palette do you want to create?">
        <div class="step1-row">
            <div class="step1-field">
                <span class="label-text">Palette type:</span>
                <ButtonGroup options="{['sequential', 'diverging']}" bind:value={mode} />
            </div>
            <div class="step1-field">
                <span class="label-text">Number of colors:</span>
                <input type="number" min="2" bind:value={numColors} />
            </div>
        </div>
    </Card>

    <Card step="2" title="Select and arrange input colors">
        <InputColors diverging="{mode==='diverging'}" bind:colors bind:colors2 />
    </Card>

    <Card step="3" title="Check and configure the resulting palette">
        <div class="row" style="margin-bottom: 10px">
            <div class="col-md">
                <Checkbox bind:value={correctLightness} label="correct lightness" />
                <Checkbox bind:value={bezier} label="bezier interpolation" />
            </div>
            <div class="col-md">
                <ColorBlindCheck bind:colors={steps} bind:active={simulate} />
            </div>
        </div>
        <PalettePreview
            bind:steps
            bind:correctLightness
            bind:bezier
            bind:colors
            bind:colors2
            diverging="{mode === 'diverging'}"
            simulate={simulate}
            bind:numColors />
        <div class="row">
            <div class="col-md">
                <StepChart title="lightness" steps={steps} mode={0} />
            </div>
            <div class="col-md">
                <StepChart title="saturation" steps={steps} mode={1} />
            </div>
            <div class="col-md">
                <StepChart title="hue" steps={steps} mode={2} />
            </div>
        </div>
    </Card>

    <Card step="4" title="Export the color codes in various formats">
        <p>You can also save your palette for later by bookmarking <a href="#/{hash}">this page</a> using <kbd>{isMac ? 'cmd' : 'ctrl'}</kbd>+<kbd>d</kbd>.</p>
        <Export steps={steps} />
    </Card>
    <div class="foot">
        <hr>
        <p>Created by <a href="https://vis4.net/blog">Gregor Aisch</a> for the sake of better use of colors in maps and data visualizations, forked and extended by <a href="https://giobuzala.com/" target="_blank">Giorgi Buzaladze</a> with an added AI layer.</p>
    </div>
</div>

<AIChatbot on:applyPalette={handleApplyPalette} />