export interface CommonLogoProps {
	/**
	 * Height of the logo in pixels.
	 * Note: setting the height without setting the width will cause the width
	 * to automatically scale to maintain the logo's aspect ratio.
	 * @default 24
	 */
	height?: number;
	/**
	 * Whether to render the logo in monochrome.
	 * @default false
	 */
	monochrome?: boolean;
	/**
	 * The accessible name of the logo.
	 * To hide the logo from assistive technologies, use the `aria-hidden`
	 * attribute.
	 */
	title?: string;
	/**
	 * Indicates whether the element is exposed to an accessibility API.
	 * Use `aria-hidden="true"` to hide the logo from assistive technologies.
	 */
	'aria-hidden'?: React.SVGAttributes< SVGSVGElement >[ 'aria-hidden' ];
}
