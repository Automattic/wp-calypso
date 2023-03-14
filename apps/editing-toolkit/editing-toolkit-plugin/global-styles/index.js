import { compose } from '@wordpress/compose';
import { withDispatch, withSelect, select } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import {
	FONT_BASE,
	FONT_BASE_DEFAULT,
	FONT_HEADINGS,
	FONT_HEADINGS_DEFAULT,
	FONT_PAIRINGS,
	FONT_OPTIONS,
	SITE_NAME,
} from './src/constants';
import registerDOMUpdater from './src/dom-updater';
import GlobalStylesSidebar from './src/global-styles-sidebar';
import { store as globalStylesStore } from './src/store';

// Tell Webpack to compile this into CSS
import './editor.scss';

// Global data passed from PHP.
const { PLUGIN_NAME } = JETPACK_GLOBAL_STYLES_EDITOR_CONSTANTS; // eslint-disable-line no-undef

registerDOMUpdater( [ FONT_BASE, FONT_HEADINGS ], select( globalStylesStore ).getOption );

registerPlugin( PLUGIN_NAME, {
	render: compose(
		withSelect( ( getSelectors ) => ( {
			siteName: getSelectors( globalStylesStore ).getOption( SITE_NAME ),
			fontHeadings: getSelectors( globalStylesStore ).getOption( FONT_HEADINGS ),
			fontHeadingsDefault: getSelectors( globalStylesStore ).getOption( FONT_HEADINGS_DEFAULT ),
			fontBase: getSelectors( globalStylesStore ).getOption( FONT_BASE ),
			fontBaseDefault: getSelectors( globalStylesStore ).getOption( FONT_BASE_DEFAULT ),
			fontPairings: getSelectors( globalStylesStore ).getOption( FONT_PAIRINGS ),
			fontOptions: getSelectors( globalStylesStore ).getOption( FONT_OPTIONS ),
			hasLocalChanges: getSelectors( globalStylesStore ).hasLocalChanges(),
		} ) ),
		withDispatch( ( dispatch ) => ( {
			updateOptions: dispatch( globalStylesStore ).updateOptions,
			publishOptions: dispatch( globalStylesStore ).publishOptions,
			resetLocalChanges: dispatch( globalStylesStore ).resetLocalChanges,
		} ) )
	)( GlobalStylesSidebar ),
} );
