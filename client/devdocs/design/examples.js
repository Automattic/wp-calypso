
/**
 * External dependencies
 */
import find from 'lodash/find';

export const examples = [
	require( 'components/accordion/docs/example' ),
	require( 'components/banner/docs/example' ),
	require( 'components/bulk-select/docs/example' ),
	require( 'components/button-group/docs/example' ),
	require( 'components/button/docs/example' ),
	require( 'components/card/docs/example' ),
	require( 'components/clipboard-button-input/docs/example' ),
	require( 'components/forms/clipboard-button/docs/example' ),
	require( 'components/count/docs/example' ),
	require( 'components/date-picker/docs/example' ),
	require( 'components/drop-zone/docs/example' ),
	require( 'components/external-link/docs/example' ),
	require( 'components/ellipsis-menu/docs/example' ),
	require( 'components/emojify/docs/example' ),
	require( 'components/feature-example/docs/example' ),
	require( 'components/forms/counted-textarea/docs/example' ),
	require( 'components/faq/docs/example' ),
	require( 'components/file-picker/docs/example' ),
	require( 'components/foldable-card/docs/example' ),
	require( 'components/forms/range/docs/example' ),
	require( 'components/forms/docs/example' ),
	require( 'components/gauge/docs/example' ),
	require( 'components/global-notices/docs/example' ),
	require( 'components/gravatar/docs/example' ),
	require( 'gridicons/build/example' ),
	require( 'components/header-cake/docs/example' ),
	require( 'components/image-preloader/docs/example' ),
	require( 'components/info-popover/docs/example' ),
	require( 'components/input-chrono/docs/example' ),
	require( 'components/language-picker/docs/example' ),
	require( 'components/notice/docs/example' ),
	require( 'components/segmented-control/docs/example' ),
	require( 'components/spinner-button/docs/example' ),
	require( 'components/search/docs/example' ),
	require( 'components/spinner-line/docs/example' ),
	require( 'components/rating/docs/example' ),
	require( 'components/ribbon/docs/example' ),
	require( 'components/payment-logo/docs/example' ),
	require( 'components/progress-bar/docs/example' ),
	require( 'components/popover/docs/example' ),
	require( 'social-logos/example' ),
	require( 'components/section-header/docs/example' ),
	require( 'components/select-dropdown/docs/example' ),
	require( 'devdocs/design/search-collection' ),
	require( 'components/section-nav/docs/example' ),
	require( 'components/spinner/docs/example' ),
	require( 'components/timezone/docs/example' ),
	require( 'components/token-field/docs/example' ),
	require( 'components/tooltip/docs/example' ),
	require( 'components/version/docs/example' ),
	require( 'components/vertical-menu/docs/example' ),
].map( Component => Component.default || Component );

export const findExample = name => {
	name = name
		.replace( /-/g, '' )
		.toLowerCase();

	return find( examples, Component => {
		const _name = getName( Component );
		return _name.toLowerCase() === name;
	} );
};

function getName( Component ) {
	return ( Component.displayName || Component.name || '' )
		.replace( /Example$/, '' );
}
