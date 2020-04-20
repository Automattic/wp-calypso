/**
 * External dependencies
 */
import { uniqueId, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_PROMOTION_EDIT,
	WOOCOMMERCE_PROMOTION_EDIT_CLEAR,
} from 'woocommerce/state/action-types';
import { getBucket } from '../helpers';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_PROMOTION_EDIT:
			return editPromotionAction( state, action );
		case WOOCOMMERCE_PROMOTION_EDIT_CLEAR:
			return clearPromotionEditsAction( state, action );
	}

	return state;
} );

function editPromotionAction( edits, action ) {
	const { promotion, data } = action;
	const prevEdits = edits || {};
	const prevPromotion = promotion || { id: { placeholder: uniqueId( 'promotion_' ) } };
	const bucket = getBucket( promotion );
	const promotionsArray = editPromotion( prevEdits[ bucket ], prevPromotion, data );

	if ( isEqual( {}, data ) ) {
		// If data is empty, only set the currentlyEditingId.
		return {
			...prevEdits,
			currentlyEditing: prevPromotion.id,
		};
	}

	return {
		...prevEdits,
		[ bucket ]: promotionsArray,
		currentlyEditingId: prevPromotion.id,
	};
}

function clearPromotionEditsAction() {
	return null;
}

function editPromotion( promotionsArray, promotion, data ) {
	const prevArray = promotionsArray || [];

	let found = false;

	// Look for this object in the array first.
	const updatedArray = prevArray.map( ( p ) => {
		if ( isEqual( promotion.id, p.id ) ) {
			found = true;
			return { ...p, ...data };
		}

		return p;
	} );

	if ( ! found ) {
		// This edit isn't in the edit state yet, so add it now.
		updatedArray.push( { id: promotion.id, ...data } );
	}

	return updatedArray;
}
