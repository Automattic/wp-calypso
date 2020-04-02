/* eslint-disable import/no-extraneous-dependencies */
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
/* eslint-enable import/no-extraneous-dependencies */

// Load config passed from backend.
const {
	templates = [],
	vertical,
	segment,
	tracksUserData,
	siteInformation = {},
	screenAction,
	theme,
	isFrontPage,
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
	hidePageTitle: Boolean( isFrontPage && hideFrontPageTitle ),
};

// Open plugin only if we are creating new page.
if ( screenAction === 'add' ) {
	dispatch( 'automattic/starter-page-layouts' ).setIsOpen( true );
	registerPlugin( 'page-templates', {
		render: () => (
			<PageTemplatesPlugin { ...templatesPluginSharedProps } shouldPrefetchAssets={ false } />
		),
	} );
}

// Always register ability to open from document sidebar.
registerPlugin( 'page-templates-sidebar', {
	render: () => {
		return (
			<PluginDocumentSettingPanel
				name="Template Modal Opener"
				title={ __( 'Page Layout' ) }
				className="page-template-modal__sidebar" // eslint-disable-line wpcalypso/jsx-classname-namespace
				icon="none"
			>
				<SidebarTemplatesPlugin
					{ ...templatesPluginSharedProps }
					siteInformation={ siteInformation }
				/>
			</PluginDocumentSettingPanel>
		);
	},
} );

// Make sidebar plugin open by default.
const unsubscribe = subscribe( () => {
	if (
		! select( 'core/edit-post' ).isEditorPanelOpened(
			'page-templates-sidebar/Template Modal Opener'
		)
	) {
		dispatch( 'core/edit-post' ).toggleEditorPanelOpened(
			'page-templates-sidebar/Template Modal Opener'
		);
	}
	unsubscribe();
} );
