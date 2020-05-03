/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { withDispatch, withSelect, select } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import registerStore from './src/store';
import registerDOMUpdater from './src/dom-updater';
import GlobalStylesSidebar from './src/global-styles-sidebar';
import {
	FONT_BASE,
	FONT_BASE_DEFAULT,
	FONT_HEADINGS,
	FONT_HEADINGS_DEFAULT,
	FONT_PAIRINGS,
	FONT_OPTIONS,
	SITE_NAME,
} from './src/constants';

// Tell Webpack to compile this into CSS
import './editor.scss';

// Global variable.
const { PLUGIN_NAME, STORE_NAME, REST_PATH } = JETPACK_GLOBAL_STYLES_EDITOR_CONSTANTS; // eslint-disable-line no-undef

registerStore( STORE_NAME, REST_PATH );
registerDOMUpdater( [ FONT_BASE, FONT_HEADINGS ], select( STORE_NAME ).getOption );

registerPlugin( PLUGIN_NAME, {
	render: compose(
		withSelect( ( getSelectors ) => ( {
			siteName: getSelectors( STORE_NAME ).getOption( SITE_NAME ),
			fontHeadings: getSelectors( STORE_NAME ).getOption( FONT_HEADINGS ),
			fontHeadingsDefault: getSelectors( STORE_NAME ).getOption( FONT_HEADINGS_DEFAULT ),
			fontBase: getSelectors( STORE_NAME ).getOption( FONT_BASE ),
			fontBaseDefault: getSelectors( STORE_NAME ).getOption( FONT_BASE_DEFAULT ),
			fontPairings: getSelectors( STORE_NAME ).getOption( FONT_PAIRINGS ),
			fontOptions: getSelectors( STORE_NAME ).getOption( FONT_OPTIONS ),
			hasLocalChanges: getSelectors( STORE_NAME ).hasLocalChanges(),
		} ) ),
		withDispatch( ( dispatch ) => ( {
			updateOptions: dispatch( STORE_NAME ).updateOptions,
			publishOptions: dispatch( STORE_NAME ).publishOptions,
			resetLocalChanges: dispatch( STORE_NAME ).resetLocalChanges,
		} ) )
	)( GlobalStylesSidebar ),
} );
