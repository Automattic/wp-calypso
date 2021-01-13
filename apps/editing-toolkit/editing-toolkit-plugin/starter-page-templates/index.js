/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { select, dispatch, subscribe } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import { PageTemplatesPlugin } from './page-template-modal';
import SidebarTemplatesPlugin from './page-template-modal/components/sidebar-modal-opener';
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
				<PluginDocumentSettingPanel
					name="Template Modal Opener"
					title={ __( 'Page Layout', 'full-site-editing' ) }
					className="page-template-modal__sidebar"
					icon="none"
				>
					<SidebarTemplatesPlugin />
				</PluginDocumentSettingPanel>
			</>
		);
	},
} );

// Make sidebar plugin open by default.
const unsubscribe = subscribe( () => {
	if (
		! select( 'core/edit-post' ).isEditorPanelOpened( 'page-templates/Template Modal Opener' )
	) {
		dispatch( 'core/edit-post' ).toggleEditorPanelOpened( 'page-templates/Template Modal Opener' );
	}
	unsubscribe();
} );
