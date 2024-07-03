export function calculateMetricsSectionScrollOffset() {
	let offset = 0;
	const headerEl = document.getElementById( 'header' );
	const menuHeight = 92;

	// Offset to account for Masterbar if it is fixed position
	offset +=
		headerEl && getComputedStyle( headerEl ).position === 'fixed'
			? headerEl.getBoundingClientRect().height
			: 0;

	// Offset to account for the metrics menu navbar
	offset += menuHeight;

	const padding = 30;

	return offset + padding;
}
