// What the modal copies from its surface: A2UI's tokens that `style.scss` reads (keep the two in
// sync), the host's WordPress components colors the surface inherits, and the color scheme.
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
	'--wp-components-color-accent',
	'--wp-components-color-accent-darker-10',
	'--wp-components-color-accent-darker-20',
	'--wp-components-color-accent-inverted',
	'--wp-components-color-background',
	'--wp-components-color-foreground',
	'color-scheme',
];

/** Copies the theme an element resolved onto one outside it, such as the modal's overlay. */
export function copyTheme( from: Element, to: HTMLElement ) {
	const style = getComputedStyle( from );

	for ( const property of THEME_PROPERTIES ) {
		to.style.setProperty( property, style.getPropertyValue( property ) );
	}
}
