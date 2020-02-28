/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
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
import FramePreview from './frame-preview';

import { initializeWithIdentity } from './page-template-modal/utils/tracking';

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
} = window.starterPageTemplatesConfig;

const iFramed = get( window, [ 'document', 'location', 'hash' ] ).match( /iframepreview=true/ );

if ( tracksUserData ) {
	initializeWithIdentity( tracksUserData );
}

if ( iFramed ) {
	window.document.body.className += ' is-frame-preview';
	registerPlugin( 'frame-template-preview', {
		render: () => {
			return <FramePreview />;
		},
	} );
} else {
	// Open plugin only if we are creating new page.
	if ( screenAction === 'add' ) {
		registerPlugin( 'page-templates', {
			render: () => {
				return (
					<PageTemplatesPlugin
						isFrontPage={ isFrontPage }
						segment={ segment }
						shouldPrefetchAssets={ false }
						templates={ templates }
						theme={ theme }
						vertical={ vertical }
					/>
				);
			},
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
						isFrontPage={ isFrontPage }
						segment={ segment }
						siteInformation={ siteInformation }
						templates={ templates }
						theme={ theme }
						vertical={ vertical }
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
}
