export interface CommonLogoProps {
	/**
	 * Different variants of the logo.
	 */
	variant?: string;
	/**
	 * Height of the logo in pixels.
	 * Note: setting the height without setting the width will cause the width
	 * to automatically scale to maintain the logo's aspect ratio.
	 * @default 32
	 */
	height?: number;
	/**
	 * Width of the logo in pixels.
	 * Note: setting the width without setting the height will cause the height
	 * to automatically scale to maintain the logo's aspect ratio.
	 */
	width?: number;
	/**
	 * Whether to render the logo in monochrome.
	 * @default false
	 */
	monochrome?: boolean;
	/**
	 * Theme of the logo:
	 * - `default`: use the default theme (ie. inherit).
	 * - `light`: use the light theme (ie. light text on dark background).
	 * - `dark`: use the dark theme (ie. dark text on light background).
	 *
	 * It is only applied when `monochrome` is `false`.
	 * @default 'default'
	 */
	theme?: 'default' | 'light' | 'dark';
}
