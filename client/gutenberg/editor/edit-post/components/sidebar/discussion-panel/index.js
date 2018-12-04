/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, PanelRow } from '@wordpress/components';
import { PostComments, PostPingbacks, PostTypeSupportCheck } from '@wordpress/editor';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Module Constants
 */
const PANEL_NAME = 'discussion-panel';

function DiscussionPanel( { isEnabled, isOpened, onTogglePanel } ) {
	if ( ! isEnabled ) {
		return null;
	}

	return (
		<PostTypeSupportCheck supportKeys={ [ 'comments', 'trackbacks' ] }>
			<PanelBody title={ __( 'Discussion' ) } opened={ isOpened } onToggle={ onTogglePanel }>
				<PostTypeSupportCheck supportKeys="comments">
					<PanelRow>
						<PostComments />
					</PanelRow>
				</PostTypeSupportCheck>

				<PostTypeSupportCheck supportKeys="trackbacks">
					<PanelRow>
						<PostPingbacks />
					</PanelRow>
				</PostTypeSupportCheck>
			</PanelBody>
		</PostTypeSupportCheck>
	);
}

export default compose( [
	withSelect( select => {
		return {
			isEnabled: select( 'core/edit-post' ).isEditorPanelEnabled( PANEL_NAME ),
			isOpened: select( 'core/edit-post' ).isEditorPanelOpened( PANEL_NAME ),
		};
	} ),
	withDispatch( dispatch => ( {
		onTogglePanel() {
			return dispatch( 'core/edit-post' ).toggleEditorPanelOpened( PANEL_NAME );
		},
	} ) ),
] )( DiscussionPanel );
