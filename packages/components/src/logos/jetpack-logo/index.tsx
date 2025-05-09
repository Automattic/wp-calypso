import colorStudio from '@automattic/color-studio';
import clsx from 'clsx';

/**
 * Module constants
 */
const PALETTE = colorStudio.colors;
const COLOR_JETPACK = PALETTE[ 'Jetpack Green 40' ];

type JetpackLogoProps = {
	/**
	 * Whether to render the full logo.
	 * @default false
	 */
	full?: boolean;
	/**
	 * Height of the logo in pixels.
	 * @default 32
	 */
	size?: number;
	/**
	 * Whether to render the logo in monochrome.
	 * @default false
	 */
	monochrome?: boolean;
	/**
	 * Theme of the logo.
	 * - `default`: use the default theme (ie. inherit).
	 * - `light`: render.
	 * - `dark`: use the dark theme.
	 * @default 'default'
	 */
	theme?: 'default' | 'light' | 'dark';
};

const LogoMarkTriangle = ( { fill }: Pick< React.SVGProps< SVGPathElement >, 'fill' > ) => {
	return (
		<path
			fill={ fill }
			fillRule="evenodd"
			d="M47.9 9.92V58.3H23L47.9 9.92Zm5.06 80.16V41.6h25l-25 48.48Z"
			clipRule="evenodd"
		/>
	);
};

const LogoMarkCircle = ( {
	fill,
	mask,
}: Pick< React.SVGProps< SVGPathElement >, 'fill' | 'mask' > ) => {
	return <circle cx="50" cy="50" r="50" fill={ fill } mask={ mask } />;
};

const LogoMark = ( { monochrome = false }: Pick< JetpackLogoProps, 'monochrome' > ) => {
	return (
		<>
			{ /* In the monochrome version: the triangles are masked out. In the
			color-branded version, the triangles are hardcoded white. */ }
			<LogoMarkCircle
				fill={ monochrome ? 'currentColor' : COLOR_JETPACK }
				mask={ monochrome ? 'url(#cutout)' : undefined }
			/>
			{ monochrome ? (
				<defs>
					<mask id="cutout">
						{ /* Full white rectangle to start with full visibility */ }
						<rect width="100" height="100" fill="#fff" />
						{ /* The shape we want to "cut out" is black in the mask */ }
						<LogoMarkTriangle fill="#000" />
					</mask>
				</defs>
			) : (
				<LogoMarkTriangle fill="#fff" />
			) }
		</>
	);
};

const LogoText = ( {
	monochrome = false,
	theme = 'default',
}: Pick< JetpackLogoProps, 'monochrome' | 'theme' > ) => {
	let textFillColor;
	// TODO: check with brand designers if we have to hardcode to white/black,
	// or if we can use the default text color from the theme.
	if ( monochrome ) {
		textFillColor = 'currentColor';
	} else if ( theme === 'dark' ) {
		textFillColor = '#fff';
	} else {
		// NOTE: currently, `default` theme behaves like `light`. But in the future,
		// when the `Theme` package is ready, `default` will inherit whatever color
		// scheme is set at the `Theme` level.
		textFillColor = '#000';
	}
	return (
		<path
			fill={ textFillColor }
			d="M129.02 83.02c-1.43-2.2-2.76-4.4-4.1-6.5 7.06-4.29 9.45-7.72 9.45-14.21V24.8h-8.3v-7.16h17.64V60.4c0 10.88-3.15 16.99-14.69 22.62ZM202.93 57.44c0 3.63 2.57 4.01 4.3 4.01 1.7 0 4.19-.57 6.1-1.14v6.67a28.36 28.36 0 0 1-9.26 1.53c-4.57 0-9.91-1.72-9.91-9.73V39.12h-4.87v-6.77h4.87V22.33h8.77v10.02h11.06v6.77h-11.06v18.32ZM221.24 86.35v-54.1h8.4v3.25c3.33-2.58 7.05-4.2 11.63-4.2 7.91 0 14.2 5.53 14.2 17.46 0 11.83-6.86 19.66-18.21 19.66-2.76 0-4.96-.39-7.25-.86v18.7h-8.77v.1Zm17.74-47.8c-2.58 0-5.82 1.24-8.87 3.91v18.42c1.9.38 3.9.67 6.58.67 6.2 0 9.72-3.92 9.72-12.12 0-7.54-2.57-10.88-7.43-10.88ZM290 67.65h-8.2v-3.91h-.2c-2.86 2.2-6.39 4.58-11.63 4.58-4.58 0-9.54-3.34-9.54-10.11 0-9.07 7.73-10.79 13.16-11.55l7.73-1.05v-1.05c0-4.77-1.91-6.3-6.4-6.3-2.19 0-7.34.67-11.53 2.39l-.76-7.06a44.13 44.13 0 0 1 13.44-2.3c8.58 0 14.12 3.44 14.12 13.65v22.71h-.2Zm-8.78-16.5-7.25 1.14c-2.19.29-4.48 1.62-4.48 4.87 0 2.86 1.62 4.48 4 4.48 2.58 0 5.35-1.53 7.73-3.24v-7.26ZM326.23 66.5c-3.62 1.25-6.86 2.01-10.97 2.01-13.15 0-18.4-7.54-18.4-18.51 0-11.55 7.25-18.7 18.98-18.7 4.38 0 7.05.76 10.01 1.72v7.44c-2.57-.96-6.3-2-9.92-2-5.34 0-9.92 2.86-9.92 11.06 0 9.07 4.58 11.83 10.4 11.83 2.76 0 5.82-.57 9.92-2.19v7.35h-.1ZM342.82 47.52c.77-.86 1.34-1.72 12.4-15.17h11.44l-14.3 16.8L368 67.74h-11.44l-13.64-16.8v16.8h-8.77v-50.1h8.77v29.87h-.1ZM182.71 66.5c-4.57 1.44-8.48 2.01-13.06 2.01-11.25 0-18.22-5.63-18.22-18.8 0-9.63 5.92-18.41 17.26-18.41 11.26 0 15.17 7.82 15.17 15.26 0 2.49-.2 3.82-.29 5.25h-22.7c.2 7.73 4.58 9.54 11.16 9.54 3.63 0 6.87-.85 10.59-2.19v7.35h.1Zm-8-20.5c0-4.3-1.44-8.02-6.11-8.02-4.39 0-7.06 3.15-7.63 8.01h13.73Z"
		/>
	);
};

// Derived from the SVG logo
const LOGO_HEIGHT = 100;
const LOGO_WIDTH = 100;
const LOGO_WIDTH_FULL = 368;

export const JetpackLogo = ( {
	full = false,
	monochrome = false,
	theme = 'default',
	size = 32,
	className,
	...props
}: JetpackLogoProps & React.SVGProps< SVGSVGElement > ) => {
	return (
		<svg
			// TODO: prefix classname with a8c-components-* (or remove it entirely with CSS modules)
			className={ clsx( 'jetpack-logo', className ) }
			// Set the height, the width will be automatically set according to the viewBox
			height={ size }
			{ ...props }
			viewBox={ `0 0 ${ full ? LOGO_WIDTH_FULL : LOGO_WIDTH } ${ LOGO_HEIGHT }` }
		>
			<LogoMark monochrome={ monochrome } />
			{ full ? <LogoText monochrome={ monochrome } theme={ theme } /> : null }
		</svg>
	);
};
