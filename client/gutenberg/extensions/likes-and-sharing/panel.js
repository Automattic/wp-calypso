/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { Component } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { CheckboxControl, PanelBody } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';

class LikesAndSharingPanel extends Component {
	render() {
		const { areLikesEnabled, isSharingEnabled, toggleLikes, toggleSharing } = this.props;

		return (
			<PanelBody title={ __( 'Likes and Sharing' ) }>
				<CheckboxControl
					label={ __( 'Show likes.' ) }
					checked={ areLikesEnabled }
					onChange={ value => {
						toggleLikes( value );
					} }
				/>

				<CheckboxControl
					label={ __( 'Show sharing buttons.' ) }
					checked={ isSharingEnabled }
					onChange={ value => {
						toggleSharing( value );
					} }
				/>
			</PanelBody>
		);
	}
}

// Fetch the post meta.
const applyWithSelect = withSelect( select => {
	const { getEditedPostAttribute } = select( 'core/editor' );
	const areLikesEnabled = getEditedPostAttribute( 'jetpack_likes_enabled' );
	const isSharingEnabled = getEditedPostAttribute( 'jetpack_sharing_enabled' );

	return {
		areLikesEnabled,
		isSharingEnabled,
	};
} );

// Provide method to update post meta.
const applyWithDispatch = withDispatch( dispatch => {
	const { editPost } = dispatch( 'core/editor' );

	return {
		toggleLikes( shouldEnableLiking ) {
			editPost( { jetpack_likes_enabled: shouldEnableLiking } );
		},
		toggleSharing( shouldEnableSharing ) {
			editPost( { jetpack_sharing_enabled: shouldEnableSharing } );
		},
	};
} );

// Combine the higher-order components.
export default compose( [ applyWithSelect, applyWithDispatch ] )( LikesAndSharingPanel );
