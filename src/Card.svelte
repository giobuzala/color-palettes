<script>
    export let title = '';
    export let step = '';
    export let noBorderTop = false;
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
		background: #f3f4f6;
		color: #4b5563;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		box-shadow: none;
		flex-shrink: 0;
	}
</style>

<div class="card">
    <h5 class="card-title">{#if step}<span class="step">{step}</span>{/if}{title}</h5>
    <slot />
</div>
