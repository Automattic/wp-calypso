/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { find, flatten, isEmpty, isNil, map, omit, some, startsWith, xor } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
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
import { updateWcsShippingZoneMethod } from 'woocommerce/woocommerce-services/state/service-settings/actions';
import { updateShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/actions';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE_DELETE,
	WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE_SAVE,
	WOOCOMMERCE_SHIPPING_ZONE_DEFAULT_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';
import {
	getShippingZoneLocationsWithEdits,
	areCurrentlyEditingShippingZoneLocationsValid,
} from 'woocommerce/state/ui/shipping/zones/locations/selectors';
import {
	getShippingZonesEdits,
	getCurrentlyEditingShippingZone,
	generateZoneName,
	generateCurrentlyEditingZoneName,
} from 'woocommerce/state/ui/shipping/zones/selectors';
import { getCurrentlyEditingShippingZoneMethods } from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import { getRawShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/selectors';
import { getShippingZoneMethod } from 'woocommerce/state/sites/shipping-zone-methods/selectors';
import { getZoneLocationsPriority } from 'woocommerce/state/sites/shipping-zone-locations/helpers';
import { getAPIShippingZones } from 'woocommerce/state/sites/shipping-zones/selectors';
import { getStoreLocation } from 'woocommerce/state/sites/settings/general/selectors';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { getCountryName } from 'woocommerce/state/sites/data/locations/selectors';
import { isDefaultShippingZoneCreated } from 'woocommerce/state/sites/setup-choices/selectors';
import { setCreatedDefaultShippingZone } from 'woocommerce/state/sites/setup-choices/actions';
import { recordTrack } from 'woocommerce/lib/analytics';

const createShippingZoneSuccess = ( actionList ) => (
	dispatch,
	getState,
	{ sentData, receivedData }
) => {
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

const createShippingZoneMethodSuccess = ( actionList ) => (
	dispatch,
	getState,
	{ sentData, receivedData }
) => {
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
	return [
		{
			description: translate( 'Updating Shipping Zone' ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					updateShippingZone(
						siteId,
						zoneData,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		},
	];
};

const getCreateShippingZoneSteps = ( siteId, zoneId, zoneProperties ) => {
	const zoneData = { id: zoneId, ...zoneProperties };
	return [
		{
			description: translate( 'Creating Shipping Zone' ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					createShippingZone(
						siteId,
						zoneData,
						createShippingZoneSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		},
	];
};

const getUpdateShippingZoneLocationsSteps = ( siteId, zoneId, locations, serverLocations ) => {
	serverLocations = serverLocations || { continent: [], country: [], state: [], postcode: [] };
	if ( ! isEmpty( locations.state ) ) {
		locations = {
			...locations,
			state: locations.state.map( ( st ) => locations.country[ 0 ] + ':' + st ),
			country: [],
		};
	}
	const areLocationsDifferent = some(
		Object.keys( locations ).map( ( key ) => {
			return ! isEmpty( xor( locations[ key ], serverLocations[ key ] ) );
		} )
	);
	if ( ! areLocationsDifferent ) {
		return [];
	}
	return [
		{
			description: translate( 'Updating Shipping Zone locations' ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					updateShippingZoneLocations(
						siteId,
						getZoneId( zoneId, actionList ),
						locations,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		},
	];
};

const getAutoOrderZonesSteps = ( siteId, zoneId, serverZones, allServerLocations ) => {
	return flatten(
		serverZones
			.map( ( { id, order } ) => {
				if ( id === zoneId || 0 === id ) {
					return null;
				}
				const newOrder = getZoneLocationsPriority( allServerLocations[ id ] ) || 5; // Put zones with no locations at the end
				if ( newOrder === order ) {
					return null;
				}
				return getUpdateShippingZoneSteps( siteId, id, { order: newOrder } );
			} )
			.filter( Boolean )
	);
};

const getZoneMethodDeleteSteps = ( siteId, zoneId, method, state ) => {
	const methodType = getShippingZoneMethod( state, method.id, siteId ).methodType;

	return [
		{
			description: translate( 'Deleting Shipping Method' ),
			onStep: ( dispatch, actionList ) => {
				recordTrack( 'calypso_woocommerce_shipping_method_deleted', {
					shipping_method: methodType,
				} );
				dispatch(
					deleteShippingZoneMethod(
						siteId,
						zoneId,
						method.id,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		},
	];
};

const getZoneMethodUpdateSteps = ( siteId, zoneId, method, state ) => {
	const { id, methodType, enabled, ...extraMethodProps } = method;
	const realMethodType = methodType || getShippingZoneMethod( state, id, siteId ).methodType;

	const isNew = 'number' !== typeof id;
	const wasEnabled = ! isNew && getShippingZoneMethod( state, id, siteId ).enabled;
	const enabledChanged = ! isNil( enabled ) && wasEnabled !== enabled;
	const isWcsMethod = startsWith( realMethodType, 'wc_services' );
	// The WCS method needs to be updated in 2 steps: "enable/disable" toggle uses the normal endpoint, rest of the props use a custom one
	const methodPropsToUpdate = isWcsMethod ? {} : { ...extraMethodProps };
	if ( enabledChanged ) {
		methodPropsToUpdate.enabled = enabled;
	}
	const steps = [];

	if ( ! isEmpty( methodPropsToUpdate ) ) {
		steps.push( {
			description: translate( 'Updating Shipping Method' ),
			onStep: ( dispatch, actionList ) => {
				if ( isNew || enabledChanged ) {
					const event =
						false !== enabled
							? 'calypso_woocommerce_shipping_method_enabled'
							: 'calypso_woocommerce_shipping_method_disabled';
					recordTrack( event, { shipping_method: realMethodType } );
				}

				dispatch(
					updateShippingZoneMethod(
						siteId,
						getZoneId( zoneId, actionList ),
						getMethodId( id, actionList ),
						methodPropsToUpdate,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		} );
	}

	if ( isWcsMethod && ! isEmpty( extraMethodProps ) ) {
		steps.push( {
			description: translate( 'Updating Shipping Method (extra settings)' ),
			onStep: ( dispatch, actionList ) => {
				dispatch(
					updateWcsShippingZoneMethod(
						siteId,
						getMethodId( id, actionList ),
						realMethodType,
						extraMethodProps,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		} );
	}

	return steps;
};

const getZoneMethodCreateSteps = ( siteId, zoneId, method, defaultOrder, state ) => {
	if ( 'number' === typeof method._originalId ) {
		const originalMethod = getShippingZoneMethod( state, method._originalId, siteId );
		method = {
			...omit( method, '_originalId' ),
			order: originalMethod.order,
		};
		if ( isNil( method.enabled ) ) {
			// If the user didn't change the "Enabled" toggle, use the value from the original method
			method.enabled = originalMethod.enabled;
		}
	} else if ( 'object' === typeof method._originalId ) {
		method = {
			...omit( method, '_originalId' ),
			order: defaultOrder + method._originalId + 1,
		};
	}

	const { id, methodType, order, ...methodProps } = method;
	const steps = [
		{
			description: translate( 'Creating Shipping Method' ),
			onStep: ( dispatch, actionList ) => {
				recordTrack( 'calypso_woocommerce_shipping_method_created', {
					shipping_method: methodType,
				} );
				dispatch(
					createShippingZoneMethod(
						siteId,
						getZoneId( zoneId, actionList ),
						id,
						methodType,
						order || defaultOrder + id.index + 1,
						createShippingZoneMethodSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		},
	];

	if ( ! isEmpty( methodProps ) ) {
		steps.push.apply(
			steps,
			getZoneMethodUpdateSteps( siteId, zoneId, { id, methodType, ...methodProps } )
		);
	} else {
		// New methods are created "enabled" by default, so if there are no extra props, it means it was created enabled
		steps.push.apply( steps, {
			description: translate( 'Updating Shipping Method' ), // Better not tell the user we're just tracking at this point
			onStep: ( dispatch, actionList ) => {
				recordTrack( 'calypso_woocommerce_shipping_method_enabled', {
					shipping_method: methodType,
				} );
				dispatch( actionListStepSuccess( actionList ) );
			},
		} );
	}
	return steps;
};

/**
 * Gets the "order" property of the last shipping method the zone currently being edited.
 * All new methods of that zone must use a higher "order" value than this.
 *
 * @param {object} state The whole Redux state tree
 * @param {number} siteId Site ID to check
 * @returns {number} The "order" property of the last zone method, or 0 if the zone has no methods.
 */
const getLastZoneMethodOrder = ( state, siteId ) => {
	const serverZones = getAPIShippingZones( state );
	const zoneId = getShippingZonesEdits( state, siteId ).currentlyEditingId;
	const serverZone = find( serverZones, { id: zoneId } );
	const serverMethodIds = serverZone ? serverZone.methodIds : [];
	const serverMethods = serverMethodIds.map( ( id ) => getShippingZoneMethod( state, id, siteId ) );
	const lastMethodOrder = Math.max( ...map( serverMethods, 'order' ) );
	return Math.max( lastMethodOrder, 0 );
};

/**
 * @param {object} serverZone Zone object as it currently exists in the server
 * @param {object} newZoneProperties New set of zone properties that the user has edited
 * @param {string} previousGeneratedName The zone name that would be autogenerated based on the locations stored in the server
 * @returns {boolean} Whether the zone name should be updated with the autogenerated zone name based on locations.
 */
const shouldSaveGeneratedName = ( serverZone, newZoneProperties, previousGeneratedName ) => {
	const previousName = serverZone && serverZone.name;
	const newName = newZoneProperties.name;

	if ( '' === newName ) {
		// The user erased the zone name, in that case it always must be generated
		return true;
	} else if ( newName ) {
		// The user changed the zone name
		if ( newName !== previousGeneratedName ) {
			// User input a zone name that's different than the previous generated name, so don't overwrite
			return false;
		}
	} else if ( previousName && previousName !== previousGeneratedName ) {
		// The user didn't change the zone name, but the zone name was already user-defined, so don't touch it
		return false;
	}
	return true;
};

export const getSaveZoneActionListSteps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const serverZones = getAPIShippingZones( state );
	const zoneEdits = getShippingZonesEdits( state, siteId );
	const zoneId = zoneEdits.currentlyEditingId;
	const zoneProperties = omit( zoneEdits.currentlyEditingChanges, 'methods', 'locations' );

	const getZoneStepsFunc =
		'number' === typeof zoneId ? getUpdateShippingZoneSteps : getCreateShippingZoneSteps;

	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	const allServerLocations = getRawShippingZoneLocations( state, siteId );
	const serverLocations = allServerLocations[ zoneId ];

	const order = getZoneLocationsPriority( locations );
	const serverZone = find( serverZones, { id: zoneId } );
	if ( ! serverZone || serverZone.order !== order ) {
		zoneProperties.order = order;
	}

	if ( 0 !== zoneId ) {
		if (
			shouldSaveGeneratedName(
				serverZone,
				zoneProperties,
				generateZoneName( state, zoneId, siteId )
			)
		) {
			zoneProperties.name = generateCurrentlyEditingZoneName( state, siteId );
		}
		if ( serverZone && serverZone.name === zoneProperties.name ) {
			// No need to update the zone name, since it's the same one saved in the server
			delete zoneProperties.name;
		}
	}

	const methodEdits = zoneEdits.currentlyEditingChanges.methods;
	const lastMethodOrder = getLastZoneMethodOrder( state, siteId );

	return [
		...getZoneStepsFunc( siteId, zoneId, zoneProperties ),
		...getAutoOrderZonesSteps( siteId, zoneId, serverZones, allServerLocations ),
		...getUpdateShippingZoneLocationsSteps( siteId, zoneId, locations, serverLocations ),
		...flatten(
			methodEdits.deletes.map( ( method ) =>
				getZoneMethodDeleteSteps( siteId, zoneId, method, state )
			)
		),
		...flatten(
			methodEdits.updates.map( ( method ) =>
				getZoneMethodUpdateSteps( siteId, zoneId, method, state )
			)
		),
		...flatten(
			methodEdits.creates.map( ( method ) =>
				getZoneMethodCreateSteps( siteId, zoneId, method, lastMethodOrder, state )
			)
		),
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
				dispatch(
					deleteShippingZone(
						siteId,
						{ id: zoneId },
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList )
					)
				);
			},
		},
	];
};

/**
 * Gets the list of steps needed to create the default Shipping Zones configuration. The default configuration will be
 * a single Shipping Zone of the country where the merchant store is in, with a "Free Shipping" method enabled for everyone.
 *
 * @param {object} state The whole Redux state tree
 * @returns {Array} List of steps
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
		const zone = {
			name: getCountryName( state, storeCountry ),
			order: getZoneLocationsPriority( locations ),
		};
		const method = { id: { index: 0 }, methodType: 'free_shipping' };

		steps.push.apply( steps, getCreateShippingZoneSteps( siteId, zoneId, zone ) );
		steps.push.apply( steps, getUpdateShippingZoneLocationsSteps( siteId, zoneId, locations ) );
		steps.push.apply( steps, getZoneMethodCreateSteps( siteId, zoneId, method ) );
	}

	steps.push( {
		description: translate( 'Finishing initial setup' ),
		onStep: ( dispatch, actionList ) => {
			setCreatedDefaultShippingZone(
				siteId,
				true
			)( dispatch )
				.then( () => dispatch( actionListStepSuccess( actionList ) ) )
				.catch( ( err ) => dispatch( actionListStepFailure( actionList, err ) ) );
		},
	} );
	return steps;
};

const validateZone = ( state, dispatch, locationsFailAction, methodsFailAction ) => {
	const siteId = getSelectedSiteId( state );
	//rest of the world can contain empty locations and methods
	const zone = getCurrentlyEditingShippingZone( state, siteId );
	if ( zone && 0 === zone.id ) {
		return true;
	}

	if ( ! areCurrentlyEditingShippingZoneLocationsValid( state, siteId ) ) {
		dispatch( locationsFailAction );
		return false;
	}

	const methods = getCurrentlyEditingShippingZoneMethods( state, siteId );
	if ( isEmpty( methods ) ) {
		dispatch( methodsFailAction );
		return false;
	}

	return true;
};

export default {
	[ WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE_DELETE ]: [
		( store, action ) => {
			const { successAction, failureAction } = action;

			const onSuccess = ( dispatch ) => {
				dispatch( successAction );
				dispatch( actionListClear() );
			};
			const onFailure = ( dispatch ) => {
				dispatch( failureAction );
				dispatch( actionListClear() );
			};
			const nextSteps = getDeleteZoneActionListSteps( store.getState() );

			store.dispatch(
				isEmpty( nextSteps ) ? onSuccess : actionListStepNext( { nextSteps, onSuccess, onFailure } )
			);
		},
	],

	[ WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE_SAVE ]: [
		( store, action ) => {
			const { successAction, failureAction, locationsFailAction, methodsFailAction } = action;

			const state = store.getState();
			const isValid = validateZone( state, store.dispatch, locationsFailAction, methodsFailAction );
			if ( ! isValid ) {
				return;
			}

			const onSuccess = ( dispatch ) => {
				dispatch( successAction );
				dispatch( actionListClear() );
			};
			const onFailure = ( dispatch ) => {
				dispatch( failureAction );
				dispatch( actionListClear() );
			};
			const nextSteps = getSaveZoneActionListSteps( store.getState() );

			store.dispatch(
				isEmpty( nextSteps ) ? onSuccess : actionListStepNext( { nextSteps, onSuccess, onFailure } )
			);
		},
	],

	[ WOOCOMMERCE_SHIPPING_ZONE_DEFAULT_ACTION_LIST_CREATE ]: [
		( store ) => {
			if ( getActionList( store.getState() ) ) {
				return;
			}
			const onComplete = ( dispatch ) => {
				dispatch( actionListClear() );
			};
			store.dispatch(
				actionListStepNext( {
					nextSteps: getCreateDefaultZoneActionListSteps( store.getState() ),
					onSuccess: onComplete,
					onFailure: onComplete,
				} )
			);
		},
	],
};
