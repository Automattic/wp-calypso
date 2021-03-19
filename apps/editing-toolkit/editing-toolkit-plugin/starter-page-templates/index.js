/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { dispatch } from '@wordpress/data';
import { initializeTracksWithIdentity } from '@automattic/page-template-modal';

/**
 * Internal dependencies
 */
import { PageTemplatesPlugin } from './page-template-plugin';
import './store';
import './index.scss';

// Load config passed from backend.
const {
	templates = [],
	tracksUserData,
	screenAction,
	theme,
	locale,
} = window.starterPageTemplatesConfig;

if ( tracksUserData ) {
	initializeTracksWithIdentity( tracksUserData );
}

// Open plugin only if we are creating new page.
if ( screenAction === 'add' ) {
	dispatch( 'automattic/starter-page-layouts' ).setOpenState( 'OPEN_FROM_ADD_PAGE' );
}

// Always register ability to open from document sidebar.
registerPlugin( 'page-templates', {
	render: () => {
		return <PageTemplatesPlugin templates={ templates } theme={ theme } locale={ locale } />;
	},
} );
