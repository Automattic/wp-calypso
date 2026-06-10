const WebpackRTLPlugin = require( '@automattic/webpack-rtl-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const MiniCSSRuntimeFullHashPlugin = require( './mini-css-runtime-full-hash' );
const MiniCSSWithRTLPlugin = require( './mini-css-with-rtl' );

const sharedSassMixins = [
	'hide-content-accessibly',
	'clear-text',
	'no-select',
	'heading',
	'clear-fix',
	'when-dark-theme',
	'display-grid',
	'grid-template-columns',
	'grid-row',
	'grid-column',
	'breakpoint-deprecated',
	'placeholder',
	'stats-fade-text',
	'calc',
	'banner-color',
	'banner-dark',
	'dropdown-menu',
	'mobile-link-element',
	'elevation',
	'tooltip-base',
	'tooltip-top',
	'tooltip-bottom',
	'tooltip-right',
	'tooltip-left',
	'long-content-fade',
	'form-field-core-styles-focus',
	'break-small',
];

const sharedSassExtends = [
	'content-font',
	'form-field',
	'form-field-core-styles',
	'placeholder',
	'mobile-link-element',
	'mobile-interface-element',
	'generic-reset',
	'rendered-block-content',
];

const sharedSassVariables = [
	'default-font',
	'default-line-height',
	'font-size-x-small',
	'font-size-small',
	'font-size-medium',
	'font-size-large',
	'font-size-x-large',
	'font-size-2x-large',
	'font-line-height-x-small',
	'font-line-height-small',
	'font-line-height-medium',
	'font-line-height-large',
	'font-line-height-x-large',
	'font-line-height-2x-large',
	'font-weight-regular',
	'font-weight-medium',
	'font-family-headings',
	'font-family-body',
	'font-family-mono',
	'grid-unit',
	'grid-unit-05',
	'grid-unit-10',
	'grid-unit-15',
	'grid-unit-20',
	'grid-unit-30',
	'grid-unit-40',
	'grid-unit-50',
	'grid-unit-60',
	'grid-unit-70',
	'grid-unit-80',
	'radius-x-small',
	'radius-small',
	'radius-medium',
	'radius-large',
	'radius-full',
	'radius-round',
	'elevation-x-small',
	'elevation-small',
	'elevation-medium',
	'elevation-large',
	'icon-size',
	'button-size',
	'button-size-next-default-40px',
	'button-size-small',
	'button-size-compact',
	'header-height',
	'panel-header-height',
	'nav-sidebar-width',
	'admin-bar-height',
	'admin-bar-height-big',
	'admin-sidebar-width',
	'admin-sidebar-width-big',
	'admin-sidebar-width-collapsed',
	'spinner-size',
	'canvas-padding',
	'modal-min-width',
	'modal-width-small',
	'modal-width-medium',
	'modal-width-large',
	'mobile-text-min-font-size',
	'sidebar-width',
	'wide-content-width',
	'widget-area-width',
	'secondary-sidebar-width',
	'editor-font-size',
	'default-block-margin',
	'text-editor-font-size',
	'editor-line-height',
	'editor-html-font',
	'block-toolbar-height',
	'border-width',
	'border-width-focus-fallback',
	'border-width-tab',
	'helptext-font-size',
	'radio-input-size',
	'radio-input-size-sm',
	'block-padding',
	'radius-block-ui',
	'shadow-popover',
	'shadow-modal',
	'block-bg-padding--v',
	'block-bg-padding--h',
	'mobile-header-toolbar-height',
	'mobile-header-toolbar-expanded-height',
	'mobile-floating-toolbar-height',
	'mobile-floating-toolbar-margin',
	'mobile-color-swatch',
	'mobile-block-toolbar-height',
	'dimmed-opacity',
	'block-edge-to-content',
	'solid-border-space',
	'dashed-border-space',
	'block-selected-margin',
	'block-selected-border-width',
	'block-selected-padding',
	'block-selected-child-margin',
	'block-selected-to-content',
	'break-xhuge',
	'break-huge',
	'break-wide',
	'break-xlarge',
	'break-large',
	'break-medium',
	'break-small',
	'break-mobile',
	'break-zoomed-in',
	'badge-padding-x',
	'badge-padding-y',
	'signup-sans',
	'breakpoints',
	'grid-size-large',
	'default-font-size',
	'content-width',
	'break-small',
	'black',
	'white',
	'alpha',
	'grid-unit-20',
	'monospace',
	'code',
	'serif-fallback',
	'serif',
	'sans',
	'sans-rtl',
	'brand-serif',
	'root-font-size',
	'font-headline-large',
	'font-headline-medium',
	'font-headline-small',
	'font-title-large',
	'font-title-medium',
	'font-title-small',
	'font-body-large',
	'font-body',
	'font-body-small',
	'font-body-extra-small',
	'font-code',
];

const sassGlobalUsagePattern = new RegExp(
	[
		'@import',
		'@use',
		`@include\\s+(${ sharedSassMixins.join( '|' ) })\\b`,
		`@extend\\s+(\\.wp-brand-font|%(${ sharedSassExtends.join( '|' ) }))\\b`,
		'\\b(rem|z-index|hex-to-rgb|overflow-gradient|map-deep-get)\\(',
		`\\$(${ sharedSassVariables.join( '|' ) })\\b`,
	].join( '|' )
);

function addPreludeIfNeeded( prelude, conditionalPrelude ) {
	if ( ! conditionalPrelude ) {
		return prelude;
	}

	return ( content, loaderContext ) => {
		if ( ! prelude || loaderContext.resourcePath.endsWith( '.css' ) ) {
			return content;
		}

		if ( ! sassGlobalUsagePattern.test( content ) ) {
			return content;
		}

		return `${ prelude }\n${ content }`;
	};
}

/**
 * Return a webpack loader object containing our styling (Sass -> CSS) stack.
 * @param  {Object}    _                              Options
 * @param  {string[]}  _.includePaths                 Sass files lookup paths
 * @param  {string}    _.prelude                      String to prepend to each Sass file
 * @param  {Object}    _.postCssOptions               PostCSS options
 * @param  {boolean}   _.conditionalPrelude           Whether to skip the prelude when unused
 * @returns {Object}                                  webpack loader object
 */
module.exports.loader = ( { includePaths, prelude, postCssOptions, conditionalPrelude } ) => ( {
	test: /\.(sc|sa|c)ss$/,
	use: [
		MiniCssExtractPlugin.loader,
		{
			loader: require.resolve( 'css-loader' ),
			options: {
				importLoaders: 2,
				// We do not want css-loader to resolve absolute paths. We
				// typically use `/` to indicate the start of the base URL,
				// but starting with css-loader v4, it started trying to handle
				// absolute paths itself.
				url: {
					filter: ( path ) => ! path.startsWith( '/' ),
				},
			},
		},
		{
			loader: require.resolve( 'postcss-loader' ),
			options: {
				postcssOptions: postCssOptions || {},
			},
		},
		{
			loader: require.resolve( 'sass-loader' ),
			options: {
				additionalData: addPreludeIfNeeded( prelude, conditionalPrelude ),
				api: 'modern',
				sassOptions: ( loaderContext ) => ( {
					loadPaths: includePaths,
					quietDeps: true,
					silenceDeprecations: [ 'mixed-decls' ],
					...( loaderContext.resourcePath.endsWith( '.css' ) ? { syntax: 'scss' } : {} ),
				} ),
			},
		},
	],
} );

/**
 * Return an array of styling relevant webpack plugin objects.
 * @param  {Object}   _                Options
 * @param  {string}   _.chunkFilename  filename pattern to use for CSS files
 * @param  {string}   _.filename       filename pattern to use for CSS chunk files
 * @param  {boolean}  _.rtl            Whether to generate RTL CSS assets
 * @returns {Object[]}                 styling relevant webpack plugin objects
 */
module.exports.plugins = ( { chunkFilename, filename, rtl = true } ) =>
	[
		new MiniCssExtractPlugin( {
			chunkFilename,
			filename,
			ignoreOrder: true, // suppress conflicting order warnings from mini-css-extract-plugin
			attributes: {
				'data-webpack': true,
			},
			experimentalUseImportModule: true,
		} ),
		new MiniCSSRuntimeFullHashPlugin(),
		rtl && new MiniCSSWithRTLPlugin(),
		rtl && new WebpackRTLPlugin(),
	].filter( Boolean );
