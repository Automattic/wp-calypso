/**
 * Returns the fixed bar at the top of the viewport, whichever one is rendered.
 *
 * When `dashboard/omnibar-radical` is enabled the omnibar replaces the masterbar
 * and renders under a different id, so callers measuring the bar must check both.
 */
export function getMasterbarElement(): HTMLElement | null {
	return document.getElementById( 'header' ) ?? document.getElementById( 'wpcom-omnibar' );
}
