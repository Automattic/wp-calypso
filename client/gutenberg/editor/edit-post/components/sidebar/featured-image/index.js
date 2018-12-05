/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { get, partial } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { PostFeaturedImage, PostFeaturedImageCheck } from '@wordpress/editor';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Module Constants
 */
const PANEL_NAME = 'featured-image';

function FeaturedImage( { isEnabled, isOpened, postType, onTogglePanel } ) {
	if ( ! isEnabled ) {
		return null;
	}

	return (
		<PostFeaturedImageCheck>
			<PanelBody
				title={ get( postType, [ 'labels', 'featured_image' ], __( 'Featured Image' ) ) }
				opened={ isOpened }
				onToggle={ onTogglePanel }
			>
				<PostFeaturedImage />
			</PanelBody>
		</PostFeaturedImageCheck>
	);
}

const applyWithSelect = withSelect( select => {
	const { getEditedPostAttribute } = select( 'core/editor' );
	const { getPostType } = select( 'core' );
	const { isEditorPanelEnabled, isEditorPanelOpened } = select( 'core/edit-post' );

	return {
		postType: getPostType( getEditedPostAttribute( 'type' ) ),
		isEnabled: isEditorPanelEnabled( PANEL_NAME ),
		isOpened: isEditorPanelOpened( PANEL_NAME ),
	};
} );

const applyWithDispatch = withDispatch( dispatch => {
	const { toggleEditorPanelOpened } = dispatch( 'core/edit-post' );

	return {
		onTogglePanel: partial( toggleEditorPanelOpened, PANEL_NAME ),
	};
} );

export default compose(
	applyWithSelect,
	applyWithDispatch
)( FeaturedImage );
