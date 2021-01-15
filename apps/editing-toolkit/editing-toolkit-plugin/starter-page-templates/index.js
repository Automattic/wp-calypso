/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { PageTemplatesPlugin } from './page-template-modal';
import { initializeWithIdentity } from './page-template-modal/utils/tracking';
import './store';

// Load config passed from backend.
const {
	templates = [],
	vertical,
	segment,
	tracksUserData,
	screenAction,
	theme,
	isFrontPage,
	locale,
	hideFrontPageTitle,
} = window.starterPageTemplatesConfig;

if ( tracksUserData ) {
	initializeWithIdentity( tracksUserData );
}

const templatesPluginSharedProps = {
	segment,
	templates,
	theme,
	vertical,
	isFrontPage,
	locale,
	hidePageTitle: Boolean( isFrontPage && hideFrontPageTitle ),
};

// Open plugin only if we are creating new page.
if ( screenAction === 'add' ) {
	dispatch( 'automattic/starter-page-layouts' ).setOpenState( 'OPEN_FROM_ADD_PAGE' );
}

// Always register ability to open from document sidebar.
registerPlugin( 'page-templates', {
	render: () => {
		return (
			<>
				<PageTemplatesPlugin { ...templatesPluginSharedProps } shouldPrefetchAssets={ false } />
			</>
		);
	},
} );
