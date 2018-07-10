/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withInstanceId } from '@wordpress/components';
import { compose, Fragment } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PostTypeSupportCheck from '../post-type-support-check';

export function PageAttributesOrder( { onUpdateOrder, instanceId, order } ) {
	const setUpdatedOrder = ( event ) => {
		const newOrder = Number( event.target.value );
		if ( newOrder >= 0 ) {
			onUpdateOrder( newOrder );
		}
	};
	// Create unique identifier for inputs
	const inputId = `editor-page-attributes__order-${ instanceId }`;

	return (
		<Fragment>
			<label htmlFor={ inputId }>
				{ __( 'Order' ) }
			</label>
			<input
				type="text"
				value={ order || 0 }
				onChange={ setUpdatedOrder }
				id={ inputId }
				size={ 6 }
			/>
		</Fragment>
	);
}

function PageAttributesOrderWithChecks( props ) {
	return (
		<PostTypeSupportCheck supportKeys="page-attributes">
			<PageAttributesOrder { ...props } />
		</PostTypeSupportCheck>
	);
}

export default compose( [
	withSelect( ( select ) => {
		return {
			order: select( 'core/editor' ).getEditedPostAttribute( 'menu_order' ),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onUpdateOrder( order ) {
			dispatch( 'core/editor' ).editPost( {
				menu_order: order,
			} );
		},
	} ) ),
	withInstanceId,
] )( PageAttributesOrderWithChecks );
