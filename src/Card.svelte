<script>
    export let title = '';
    export let step = '';
    /** Step badge style: 'default' | 'ring' | 'filled' | 'minimal' */
    export let stepVariant = 'default';
</script>

<style>
    .card {
        margin-bottom: 14px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        padding: 20px 28px 16px;
    }
    h5.card-title {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        font-size: 1.15rem;
        font-weight: 600;
        color: #374151;
        margin-top: 0;
        margin-bottom: 14px;
    }
    span.step {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        min-width: 28px;
        min-height: 28px;
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        flex-shrink: 0;
    }
    /* default: light gray rounded square */
    span.step.variant-default {
        background: #f3f4f6;
        color: #4b5563;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        box-shadow: none;
    }
    /* ring: outline only, no fill */
    span.step.variant-ring {
        background: transparent;
        color: #6b7280;
        border: 2px solid #9ca3af;
        border-radius: 50%;
    }
    /* filled: dark badge, white text */
    span.step.variant-filled {
        background: #374151;
        color: #fff;
        border: none;
        border-radius: 8px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }
    /* minimal: soft pill, no border */
    span.step.variant-minimal {
        background: #eef2ff;
        color: #4338ca;
        border: none;
        border-radius: 999px;
        width: 26px;
        height: 26px;
        min-width: 26px;
        min-height: 26px;
        font-size: 0.85rem;
    }
</style>

<div class="card">
    <h5 class="card-title">{#if step}<span class="step variant-{stepVariant}">{step}</span>{/if}{title}</h5>
    <slot />
</div>
