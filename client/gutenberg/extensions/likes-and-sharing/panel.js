/**
 * External dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
// import { Component, Fragment } from '@wordpress/element';
import { Component } from '@wordpress/element';

// import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
// import { registerPlugin } from '@wordpress/plugins';
import { CheckboxControl, PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class LikesAndSharingPanel extends Component {
	render() {
		// const { meta: { switch_like_status } = {}, updateMeta } = this.props;

		return (
			<PanelBody title={ __( 'Likes and Sharing' ) }>
				<CheckboxControl
					label={ __( 'Show Like Button' ) }
					//onChange={ ( value ) => {
					//	updateMeta( { switch_like_status: value } );
					//} }
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
