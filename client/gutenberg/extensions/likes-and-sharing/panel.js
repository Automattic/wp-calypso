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
		const { updateMeta, isSharingDisabled, areLikesEnabled } = this.props;

		return (
			<PanelBody title={ __( 'Likes and Sharing' ) }>
				<CheckboxControl
					label={ __( 'Show likes.' ) }
					checked={ areLikesEnabled }
					onChange={ value => {
						updateMeta( { switch_like_status: ! value } );
					} }
				/>

				<CheckboxControl
					label={ __( 'Show sharing buttons.' ) }
					checked={ ! isSharingDisabled }
					onChange={ value => {
						updateMeta( { sharing_disabled: ! value } );
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
		isSharingDisabled: get( meta, [ 'sharing_disabled' ], '' ),
		areLikesEnabled: ! get( meta, [ 'switch_like_status' ] ), // todo site option
	};
} );

// Provide method to update post meta.
const applyWithDispatch = withDispatch( ( dispatch, { meta } ) => {
	const { editPost } = dispatch( 'core/editor' );

	// todo: handle switch_like_status logic
	// todo: flip sharing_disabled here

	return {
		updateMeta( newMeta ) {
			editPost( { meta: { ...meta, ...newMeta } } ); // Important: Old and new meta need to be merged in a non-mutating way!
		},
	};
} );

// Combine the higher-order components.
export default compose( [ applyWithSelect, applyWithDispatch ] )( LikesAndSharingPanel );
