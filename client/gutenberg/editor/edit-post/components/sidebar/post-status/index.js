/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal Dependencies
 */
import PostVisibility from '../post-visibility';
import PostTrash from '../post-trash';
import PostSchedule from '../post-schedule';
import PostSticky from '../post-sticky';
import PostAuthor from '../post-author';
import PostFormat from '../post-format';
import PostPendingStatus from '../post-pending-status';
import { PluginPostStatusInfo } from '@wordpress/edit-post';

/**
 * Module Constants
 */
const PANEL_NAME = 'post-status';

function PostStatus( { isOpened, onTogglePanel } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<PanelBody className="edit-post-post-status" title={ __( 'Status & Visibility' ) } opened={ isOpened } onToggle={ onTogglePanel }>
			<PluginPostStatusInfo.Slot>
				{ ( fills ) => (
					<Fragment>
						<PostVisibility />
						<PostSchedule />
						<PostFormat />
						<PostSticky />
						<PostPendingStatus />
						<PostAuthor />
						{ fills }
						<PostTrash />
					</Fragment>
				) }
			</PluginPostStatusInfo.Slot>
		</PanelBody>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default compose( [
	withSelect( ( select ) => ( {
		isOpened: select( 'core/edit-post' ).isEditorSidebarPanelOpened( PANEL_NAME ),
	} ) ),
	withDispatch( ( dispatch ) => ( {
		onTogglePanel() {
			return dispatch( 'core/edit-post' ).toggleGeneralSidebarEditorPanel( PANEL_NAME );
		},
	} ) ),
] )( PostStatus );

