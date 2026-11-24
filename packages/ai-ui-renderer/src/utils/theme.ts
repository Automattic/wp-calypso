// What the modal copies from its surface: A2UI's tokens and the host colors the
// surface resolved, both as `style.scss` names them (keep the two in sync), and the color scheme.
const THEME_PROPERTIES = [
	'--a2ui-color-primary',
	'--a2ui-color-primary-hover',
	'--a2ui-color-primary-dark',
	'--a2ui-color-on-primary',
	'--a2ui-color-surface',
	'--a2ui-color-on-surface',
	'--a2ui-color-input',
	'--a2ui-color-on-input',
	'--a2ui-color-border',
	'--ai-ui-renderer-host-accent',
	'--ai-ui-renderer-host-accent-darker-10',
	'--ai-ui-renderer-host-accent-darker-20',
	'--ai-ui-renderer-host-accent-inverted',
	'--ai-ui-renderer-host-background',
	'--ai-ui-renderer-host-foreground',
	'color-scheme',
];

/** Copies the theme an element resolved onto one outside it, such as the modal's overlay. */
export function copyTheme( from: Element, to: HTMLElement ) {
	const style = getComputedStyle( from );
	const properties = new Set( THEME_PROPERTIES );

	for ( const property of Array.from( style ) ) {
		if ( property.startsWith( '--ai-ui-theme-' ) ) {
			properties.add( property );
		}
	}

	for ( const property of Array.from( to.style ) ) {
		if ( property.startsWith( '--ai-ui-theme-' ) && ! properties.has( property ) ) {
			to.style.removeProperty( property );
		}
	}

	for ( const property of properties ) {
		to.style.setProperty( property, style.getPropertyValue( property ) );
	}
}

export function observeTheme( from: Element, to: HTMLElement ) {
	const update = () => copyTheme( from, to );
	const observer = new MutationObserver( update );
	const media = window.matchMedia( '(prefers-color-scheme: dark)' );

	for ( let ancestor: Element | null = from; ancestor; ancestor = ancestor.parentElement ) {
		observer.observe( ancestor, {
			attributes: true,
			attributeFilter: [ 'class', 'style', 'data-ai-ui-theme' ],
		} );
	}

	media.addEventListener( 'change', update );
	update();

	return () => {
		observer.disconnect();
		media.removeEventListener( 'change', update );
	};
}
