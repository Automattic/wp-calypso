/**
 * External dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
// import { Component, Fragment } from '@wordpress/element';
import { Component } from '@wordpress/element';

import { CheckboxControl, PanelBody } from '@wordpress/components';
import PostMetadata from 'lib/post-metadata';
// import { updatePostMetadata, deletePostMetadata } from 'state/posts/actions';
// import { getSitePost, getEditedPost } from 'state/posts/selectors';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class LikesAndSharingPanel extends Component {
	render() {
		const { meta: { switch_like_status, sharing_enabled } = {}, updateMeta } = this.props;

		return (
			<PanelBody title={ __( 'Likes and Sharing' ) }>
				<CheckboxControl
					label={ __( 'Show Like Button' ) }
					checked={ switch_like_status }
					onChange={ value => {
						updateMeta( { switch_like_status: value } );
					} }
				/>

				<CheckboxControl
					label={ __( 'Show Sharing Buttons' ) }
					// checked={ sharing_enabled }
					checked={ PostMetadata.isSharingEnabled( this.props.post ) }
					onChange={ value => {
						updateMeta( { sharing_enabled: value } );
					} }
				/>
			</PanelBody>
		);
	}
}

// Fetch the post meta.
const applyWithSelect = withSelect( select => {
	const { getEditedPostAttribute } = select( 'core/editor' );

	return {
		meta: getEditedPostAttribute( 'meta' ),
	};
} );

// Provide method to update post meta.
const applyWithDispatch = withDispatch( ( dispatch, { meta } ) => {
	const { editPost } = dispatch( 'core/editor' );

	return {
		updateMeta( newMeta ) {
			editPost( { meta: { ...meta, ...newMeta } } ); // Important: Old and new meta need to be merged in a non-mutating way!
		},
	};
} );

// Combine the higher-order components.
export default compose( [ applyWithSelect, applyWithDispatch ] )( LikesAndSharingPanel );

// export default withSelect( select => {
// 	const getEditedPostAttribute = select( 'core/editor' );

// 	return {
// 		meta: getEditedPostAttribute( 'meta' ),
// 	}
// } )( LikesAndSharingPanel );
