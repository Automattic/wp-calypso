export function calculateMetricsSectionScrollOffset() {
	let offset = 0;
	const headerEl = document.getElementById( 'header' );
	const menuNavbarEl = document.querySelector( '.metrics-menu-navbar' );

	// Offset to account for Masterbar if it is fixed position
	offset +=
		headerEl && getComputedStyle( headerEl ).position === 'fixed'
			? headerEl.getBoundingClientRect().height
			: 0;

	// Offset to account for the metrics menu navbar
	offset += menuNavbarEl ? menuNavbarEl.getBoundingClientRect().height : 0;

	const padding = 20;

	return offset + padding;
}
