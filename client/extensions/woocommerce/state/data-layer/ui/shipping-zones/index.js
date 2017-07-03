/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { isEmpty, omit, some, xor } from 'lodash';

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
import { updateShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/actions';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';
import { getShippingZoneLocationsWithEdits } from 'woocommerce/state/ui/shipping/zones/locations/selectors';
import { getRawShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/selectors';

const createShippingZoneSuccess = ( actionList ) => ( dispatch, getState, { sentData, receivedData } ) => {
	const zoneIdMapping = {
		...actionList.productIdMapping,
		[ sentData.id.index ]: receivedData.id,
	};

	const newActionList = {
		...actionList,
		zoneIdMapping,
	};

	dispatch( actionListStepSuccess( newActionList ) );
};

const getZoneId = ( zoneId, { zoneIdMapping } ) => {
	return 'number' === typeof zoneId ? zoneId : zoneIdMapping[ zoneId.index ];
};

const getUpdateShippingZoneSteps = ( siteId, zoneId, zoneProperties ) => {
	if ( isEmpty( zoneProperties ) ) {
		return [];
	}
	const zoneData = { id: zoneId, ...zoneProperties };
	return [ {
		description: translate( 'Updating Shipping Zone' ),
		onStep: ( dispatch, actionList ) => {
			dispatch( updateShippingZone(
				siteId,
				zoneData,
				actionListStepSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );
		},
	} ];
};

const getCreateShippingZoneSteps = ( siteId, zoneId, zoneProperties ) => {
	const zoneData = { id: zoneId, ...zoneProperties };
	return [ {
		description: translate( 'Creating Shipping Zone' ),
		onStep: ( dispatch, actionList ) => {
			dispatch( createShippingZone(
				siteId,
				zoneData,
				createShippingZoneSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );
		},
	} ];
};

const getUpdateShippingZoneLocationsSteps = ( siteId, zoneId, locations, serverLocations ) => {
	serverLocations = serverLocations || { continent: [], country: [], state: [], postcode: [] };
	if ( ! isEmpty( locations.state ) ) {
		locations.state = locations.state.map( st => locations.country[ 0 ] + ':' + st );
		locations.country = [];
	}
	const areLocationsDifferent = some( Object.keys( locations ).map( ( key ) => {
		return ! isEmpty( xor( locations[ key ], serverLocations[ key ] ) );
	} ) );
	if ( ! areLocationsDifferent ) {
		return [];
	}
	return [ {
		description: translate( 'Updating Shipping Zone locations' ),
		onStep: ( dispatch, actionList ) => {
			dispatch( updateShippingZoneLocations(
				siteId,
				getZoneId( zoneId, actionList ),
				locations,
				actionListStepSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );
		},
	} ];
};

const getSaveZoneActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const zoneEdits = getShippingZonesEdits( state, siteId );
	const zoneId = zoneEdits.currentlyEditingId;
	const zoneProperties = omit( zoneEdits.currentlyEditingChanges, 'methods', 'locations' );

	const getZoneStepsFunc = 'number' === typeof zoneId ? getUpdateShippingZoneSteps : getCreateShippingZoneSteps;

	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	const serverLocations = getRawShippingZoneLocations( state, siteId )[ zoneId ];

	return [
		...getZoneStepsFunc( siteId, zoneId, zoneProperties ),
		...getUpdateShippingZoneLocationsSteps( siteId, zoneId, locations, serverLocations ),
		// TODO: auto-order operations
		// TODO: create methods
		// TODO: update methods
		// TODO: delete methods
	];
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
