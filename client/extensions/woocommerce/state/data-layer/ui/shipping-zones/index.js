/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { isEmpty, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getShippingZonesEdits } from 'woocommerce/state/ui/shipping/zones/selectors';
import {
	createShippingZone,
	updateShippingZone,
	deleteShippingZone,
} from 'woocommerce/state/sites/shipping-zones/actions';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';

const getSaveZoneActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const zoneEdits = getShippingZonesEdits( state, siteId );
	const steps = [];
	const zoneId = zoneEdits.currentlyEditingId;

	const zoneProperties = omit( zoneEdits.currentlyEditingChanges, 'methods', 'locations' );

	const zoneData = { id: zoneId, ...zoneProperties };
	if ( 'number' === typeof zoneId ) {
		if ( ! isEmpty( zoneProperties ) ) {
			steps.push( {
				description: translate( 'Updating Shipping Zone' ),
				onStep: ( dispatch, actionList ) => {
					dispatch( updateShippingZone(
						siteId,
						zoneData,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList ),
					) );
				},
			} );
		}
	} else {
		steps.push( {
			description: translate( 'Creating Shipping Zone' ),
			onStep: ( dispatch, actionList ) => {
				dispatch( createShippingZone(
					siteId,
					zoneData,
					actionListStepSuccess( actionList ),
					actionListStepFailure( actionList ),
				) );
			},
		} );
	}

	// TODO: update locations
	// TODO: auto-order operations
	// TODO: create methods
	// TODO: update methods
	// TODO: delete methods

	return steps;
};

const getDeleteZoneActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const zoneEdits = getShippingZonesEdits( state, siteId );
	const zoneId = zoneEdits.currentlyEditingId;

	if ( 'number' !== typeof zoneId ) {
		return [];
	}
	return [
		{
			description: translate( 'Deleting Shipping Zone' ),
			onStep: ( dispatch, actionList ) => {
				dispatch( deleteShippingZone(
					siteId,
					{ id: zoneId },
					actionListStepSuccess( actionList ),
					actionListStepFailure( actionList ),
				) );
			},
		}
	];
};

export default {
	[ WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE ]: [
		( store, action ) => {
			const { successAction, failureAction, deleteZone } = action;

			const onSuccess = ( dispatch ) => {
				dispatch( successAction );
				dispatch( actionListClear() );
			};
			const onFailure = ( dispatch ) => {
				dispatch( failureAction );
				dispatch( actionListClear() );
			};
			const nextSteps = ( deleteZone ? getDeleteZoneActionListSteps : getSaveZoneActionListSteps )( store.getState() );

			store.dispatch( actionListStepNext( { nextSteps, onSuccess, onFailure } ) );
		}
	],
};
