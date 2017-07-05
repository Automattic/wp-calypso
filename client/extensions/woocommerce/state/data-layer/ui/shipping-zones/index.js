/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { find, flatten, isEmpty, isNil, omit, some, xor } from 'lodash';

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
	createShippingZoneMethod,
	updateShippingZoneMethod,
	deleteShippingZoneMethod,
} from 'woocommerce/state/sites/shipping-zone-methods/actions';
import { updateShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/actions';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE,
	WOOCOMMERCE_SHIPPING_ZONE_DEFAULT_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';
import { getShippingZoneLocationsWithEdits } from 'woocommerce/state/ui/shipping/zones/locations/selectors';
import { getRawShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/selectors';
import { getShippingZoneMethod } from 'woocommerce/state/sites/shipping-zone-methods/selectors';
import { getZoneLocationsPriority } from 'woocommerce/state/sites/shipping-zone-locations/helpers';
import { getAPIShippingZones } from 'woocommerce/state/sites/shipping-zones/selectors';
import analytics from 'lib/analytics';
import { getStoreLocation } from 'woocommerce/state/sites/settings/general/selectors';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { getCountryName } from 'woocommerce/state/sites/locations/selectors';
import { isDefaultShippingZoneCreated } from 'woocommerce/state/sites/setup-choices/selectors';
import { setCreatedDefaultShippingZone } from 'woocommerce/state/sites/setup-choices/actions';

const createShippingZoneSuccess = ( actionList ) => ( dispatch, getState, { sentData, receivedData } ) => {
	const zoneIdMapping = {
		...actionList.zoneIdMapping,
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

const createShippingZoneMethodSuccess = ( actionList ) => ( dispatch, getState, { sentData, receivedData } ) => {
	const methodIdMapping = {
		...actionList.methodIdMapping,
		[ sentData.id.index ]: receivedData.id,
	};

	const newActionList = {
		...actionList,
		methodIdMapping,
	};

	dispatch( actionListStepSuccess( newActionList ) );
};

const getMethodId = ( methodId, { methodIdMapping } ) => {
	return 'number' === typeof methodId ? methodId : methodIdMapping[ methodId.index ];
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

const getAutoOrderZonesSteps = ( siteId, zoneId, serverZones, allServerLocations ) => {
	return flatten( serverZones.map( ( { id, order } ) => {
		if ( id === zoneId || 0 === id ) {
			return null;
		}
		const newOrder = getZoneLocationsPriority( allServerLocations[ id ] ) || 5; // Put zones with no locations at the end
		if ( newOrder === order ) {
			return null;
		}
		return getUpdateShippingZoneSteps( siteId, id, { order: newOrder } );
	} ).filter( Boolean ) );
};

const getZoneMethodDeleteSteps = ( siteId, zoneId, method, state ) => {
	const methodType = getShippingZoneMethod( state, method.id, siteId ).methodType;

	return [ {
		description: translate( 'Deleting Shipping Method' ),
		onStep: ( dispatch, actionList ) => {
			analytics.tracks.recordEvent( 'calypso_woocommerce_shipping_method_deleted', {
				shipping_method: methodType,
			} );
			dispatch( deleteShippingZoneMethod(
				siteId,
				zoneId,
				method.id,
				actionListStepSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );
		},
	} ];
};

const getZoneMethodUpdateSteps = ( siteId, zoneId, method, state ) => {
	const { id, ...methodProps } = method;
	const methodType = methodProps.methodType || getShippingZoneMethod( state, id, siteId ).methodType;
	delete methodProps.methodType;
	if ( isEmpty( methodProps ) ) {
		return [];
	}

	const isNew = 'number' !== typeof id;
	const wasEnabled = ! isNew && getShippingZoneMethod( state, id, siteId ).enabled;
	const enabledChanged = ! isNil( methodProps.enabled ) && wasEnabled !== methodProps.enabled;

	return [ {
		description: translate( 'Updating Shipping Method' ),
		onStep: ( dispatch, actionList ) => {
			if ( isNew || enabledChanged ) {
				const event = false !== methodProps.enabled
					? 'calypso_woocommerce_shipping_method_enabled'
					: 'calypso_woocommerce_shipping_method_disabled';
				analytics.tracks.recordEvent( event, { shipping_method: methodType } );
			}

			dispatch( updateShippingZoneMethod(
				siteId,
				getZoneId( zoneId, actionList ),
				getMethodId( id, actionList ),
				methodProps,
				actionListStepSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );
		},
	} ];
};

const getZoneMethodCreateSteps = ( siteId, zoneId, method, state ) => {
	if ( ! isNil( method._originalId ) ) {
		method = {
			...omit( method, '_originalId' ),
			order: getShippingZoneMethod( state, method._originalId, siteId ).order,
		};
	}

	const { id, methodType, order, ...methodProps } = method;
	const steps = [ {
		description: translate( 'Creating Shipping Method' ),
		onStep: ( dispatch, actionList ) => {
			analytics.tracks.recordEvent( 'calypso_woocommerce_shipping_method_created', {
				shipping_method: methodType,
			} );
			dispatch( createShippingZoneMethod(
				siteId,
				getZoneId( zoneId, actionList ),
				id,
				methodType,
				order,
				createShippingZoneMethodSuccess( actionList ),
				actionListStepFailure( actionList ),
			) );
		},
	} ];

	if ( ! isEmpty( methodProps ) ) {
		steps.push.apply( steps, getZoneMethodUpdateSteps( siteId, zoneId, { id, methodType, ...methodProps } ) );
	} else {
		// New methods are created "enabled" by default, so if there are no extra props, it means it was created enabled
		steps.push.apply( steps, {
			description: translate( 'Updating Shipping Method' ), // Better not tell the user we're just tracking at this point
			onStep: ( dispatch, actionList ) => {
				analytics.tracks.recordEvent( 'calypso_woocommerce_shipping_method_enabled', {
					shipping_method: methodType,
				} );
				dispatch( actionListStepSuccess( actionList ) );
			},
		} );
	}
	return steps;
};

export const getSaveZoneActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const serverZones = getAPIShippingZones( state );
	const zoneEdits = getShippingZonesEdits( state, siteId );
	const zoneId = zoneEdits.currentlyEditingId;
	const zoneProperties = omit( zoneEdits.currentlyEditingChanges, 'methods', 'locations' );

	const getZoneStepsFunc = 'number' === typeof zoneId ? getUpdateShippingZoneSteps : getCreateShippingZoneSteps;

	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	const allServerLocations = getRawShippingZoneLocations( state, siteId );
	const serverLocations = allServerLocations[ zoneId ];

	const order = getZoneLocationsPriority( locations );
	const serverZone = find( serverZones, { id: zoneId } );
	if ( ! serverZone || serverZone.order !== order ) {
		zoneProperties.order = order;
	}

	const methodEdits = zoneEdits.currentlyEditingChanges.methods;

	return [
		...getZoneStepsFunc( siteId, zoneId, zoneProperties ),
		...getAutoOrderZonesSteps( siteId, zoneId, serverZones, allServerLocations ),
		...getUpdateShippingZoneLocationsSteps( siteId, zoneId, locations, serverLocations ),
		...flatten( methodEdits.deletes.map( method => getZoneMethodDeleteSteps( siteId, zoneId, method, state ) ) ),
		...flatten( methodEdits.updates.map( method => getZoneMethodUpdateSteps( siteId, zoneId, method, state ) ) ),
		...flatten( methodEdits.creates.map( method => getZoneMethodCreateSteps( siteId, zoneId, method, state ) ) ),
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

/**
 * Gets the list of steps needed to create the default Shipping Zones configuration. The default configuration will be
 * a single Shipping Zone of the country where the merchant store is in, with a "Free Shipping" method enabled for everyone.
 * @param {Object} state The whole Redux state tree
 * @return {Array} List of steps
 */
export const getCreateDefaultZoneActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const serverZones = getAPIShippingZones( state );
	if ( isDefaultShippingZoneCreated( state ) ) {
		// The default zone was already created at some point in the past. Don't do anything.
		return [];
	}

	// Only create the zone if there are no zones already configured
	const steps = [];
	if ( 1 === serverZones.length && isEmpty( serverZones[ 0 ].methodIds ) ) {
		const zoneId = { index: 0 };
		const storeCountry = getStoreLocation( state ).country;
		const locations = { continent: [], country: [ storeCountry ], state: [], postcode: [] };
		const zone = { name: getCountryName( state, storeCountry ), order: getZoneLocationsPriority( locations ) };
		const method = { id: { index: 0 }, methodType: 'free_shipping' };

		steps.push.apply( steps, getCreateShippingZoneSteps( siteId, zoneId, zone ) );
		steps.push.apply( steps, getUpdateShippingZoneLocationsSteps( siteId, zoneId, locations ) );
		steps.push.apply( steps, getZoneMethodCreateSteps( siteId, zoneId, method ) );
	}

	steps.push( {
		description: translate( 'Finishing initial setup' ),
		onStep: ( dispatch, actionList ) => {
			setCreatedDefaultShippingZone( siteId, true )( dispatch )
				.then( () => dispatch( actionListStepSuccess( actionList ) ) )
				.catch( err => dispatch( actionListStepFailure( actionList, err ) ) );
		},
	} );
	return steps;
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

			store.dispatch( isEmpty( nextSteps ) ? onSuccess : actionListStepNext( { nextSteps, onSuccess, onFailure } ) );
		}
	],

	[ WOOCOMMERCE_SHIPPING_ZONE_DEFAULT_ACTION_LIST_CREATE ]: [
		( store ) => {
			if ( getActionList( store.getState() ) ) {
				return;
			}
			const onComplete = ( dispatch ) => {
				dispatch( actionListClear() );
			};
			store.dispatch( actionListStepNext( {
				nextSteps: getCreateDefaultZoneActionListSteps( store.getState() ),
				onSuccess: onComplete,
				onFailure: onComplete,
			} ) );
		}
	],
};
