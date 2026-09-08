export function getOmnibarElement(): HTMLElement | null {
	return document.getElementById( 'header' ) ?? document.getElementById( 'wpcom-omnibar' );
}
