/**
 * External dependencies
 */
import get from 'lodash/get';

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
	const meta = getEditedPostAttribute( 'meta' );

	return {
		areLikesEnabled: ! get( meta, [ 'switch_like_status' ] ), // todo site option
		isSharingEnabled: ! get( meta, [ 'sharing_disabled' ], '' ),
		meta,
	};
} );

// Provide method to update post meta.
const applyWithDispatch = withDispatch( ( dispatch, { meta } ) => {
	const { editPost } = dispatch( 'core/editor' );

	// todo: handle switch_like_status logic

	return {
		toggleLikes( value ) {
			editPost( { meta: { ...meta, switch_like_status: ! value } } );
		},
		toggleSharing( value ) {
			editPost( { meta: { ...meta, sharing_disabled: ! value } } );
		},
	};
} );

// Combine the higher-order components.
export default compose( [ applyWithSelect, applyWithDispatch ] )( LikesAndSharingPanel );
