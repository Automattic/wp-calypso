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
					onChange={ toggleLikes }
				/>

				<CheckboxControl
					label={ __( 'Show sharing buttons.' ) }
					checked={ isSharingEnabled }
					onChange={ toggleSharing }
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
	};
} );

// Provide method to update post meta.
const applyWithDispatch = withDispatch(
	( dispatch, { meta, areLikesEnabled, isSharingEnabled } ) => {
		const { editPost } = dispatch( 'core/editor' );

		// todo: handle switch_like_status logic

		return {
			toggleLikes: () => editPost( { meta: { ...meta, switch_like_status: ! areLikesEnabled } } ),
			toggleSharing: () => editPost( { meta: { ...meta, sharing_disabled: ! isSharingEnabled } } ),
		};
	}
);

// Combine the higher-order components.
export default compose( [ applyWithSelect, applyWithDispatch ] )( LikesAndSharingPanel );
