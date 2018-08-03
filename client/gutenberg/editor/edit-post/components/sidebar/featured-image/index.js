/**
 * External dependencies
 */
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

function FeaturedImage( { isOpened, postType, onTogglePanel } ) {
	return (
		<PostFeaturedImageCheck>
			<PanelBody
				title={ get(
					postType,
					[ 'labels', 'featured_image' ],
					__( 'Featured Image' )
				) }
				opened={ isOpened }
				onToggle={ onTogglePanel }
			>
				<PostFeaturedImage />
			</PanelBody>
		</PostFeaturedImageCheck>
	);
}

const applyWithSelect = withSelect( ( select ) => {
	const { getEditedPostAttribute } = select( 'core/editor' );
	const { getPostType } = select( 'core' );
	const { isEditorSidebarPanelOpened } = select( 'core/edit-post' );

	return {
		postType: getPostType( getEditedPostAttribute( 'type' ) ),
		isOpened: isEditorSidebarPanelOpened( PANEL_NAME ),
	};
} );

const applyWithDispatch = withDispatch( ( dispatch ) => {
	const { toggleGeneralSidebarEditorPanel } = dispatch( 'core/edit-post' );

	return {
		onTogglePanel: partial( toggleGeneralSidebarEditorPanel, PANEL_NAME ),
	};
} );

export default compose(
	applyWithSelect,
	applyWithDispatch,
)( FeaturedImage );
