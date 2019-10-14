/**
 * External dependencies
 */
import { find, findIndex, isEmpty, isEqual, isNil, omit, reject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_OPEN,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETED,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_OPENED_ENABLED,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED,
} from 'woocommerce/state/action-types';
import { getBucket } from 'woocommerce/state/ui/helpers';
import flatRate from './flat-rate/reducer';
import freeShipping from './free-shipping/reducer';
import localPickup from './local-pickup/reducer';
import wcsServiceSettings from 'woocommerce/woocommerce-services/state/service-settings/reducer';

export const builtInShippingMethods = {
	flat_rate: flatRate,
	free_shipping: freeShipping,
	local_pickup: localPickup,
	wc_services_usps: wcsServiceSettings,
	wc_services_canada_post: wcsServiceSettings,
	wc_services_fedex: wcsServiceSettings,
};

export const initialState = {
	creates: [],
	updates: [],
	deletes: [],
	currentlyEditingId: null,
	currentlyEditingNew: false,
	currentlyEditingChangedType: false,
};

/**
 * Gets the temporal ID object that the next created method should have.
 * @param {Object} state Current edit state
 * @return {Object} Object with an "index" property, guaranteed to be unique
 */
const nextCreateId = state => {
	return {
		index: isEmpty( state.creates ) ? 0 : state.creates[ state.creates.length - 1 ].id.index + 1,
	};
};

export default function mainReducer( state = initialState, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD: {
			const { methodType, title } = action;
			const id = nextCreateId( state );
			let method = { id, methodType };
			if ( builtInShippingMethods[ methodType ] ) {
				method = {
					...method,
					title,
					...builtInShippingMethods[ methodType ]( undefined, action ),
				};
			}
			return {
				...state,
				currentlyEditingId: id,
				currentlyEditingNew: true,
				currentlyEditingChangedType: false,
				currentlyEditingChanges: method,
			};
		}

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_OPEN:
			return {
				...state,
				currentlyEditingId: action.methodId,
				currentlyEditingChanges: {},
				currentlyEditingChangedType: false,
				currentlyEditingNew: false,
			};

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_CANCEL:
			return {
				...state,
				currentlyEditingId: null,
				currentlyEditingChangedType: false,
				currentlyEditingNew: false,
			};

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE: {
			const {
				currentlyEditingId,
				currentlyEditingChanges,
				currentlyEditingNew,
				currentlyEditingChangedType,
			} = state;

			if ( null === currentlyEditingId ) {
				return state;
			}
			if ( isEmpty( currentlyEditingChanges ) ) {
				// Nothing to save, no need to go through the rest of the algorithm
				return {
					...state,
					currentlyEditingChangedType: false,
					currentlyEditingNew: false,
					currentlyEditingId: null,
				};
			}

			const bucket = getBucket( { id: currentlyEditingId } );

			if ( currentlyEditingNew ) {
				return {
					...state,
					creates: [ ...state.creates, currentlyEditingChanges ],
					currentlyEditingId: null,
					currentlyEditingNew: false,
					currentlyEditingChangedType: false,
					currentlyEditingChanges: {},
				};
			}

			//if method type has been changed, then remove the old one and a new method in its place
			if ( currentlyEditingChangedType ) {
				const method = find( state[ bucket ], { id: currentlyEditingId } );
				let originalId = currentlyEditingId;
				if ( method && ! isNil( method._originalId ) ) {
					originalId = method._originalId;
				}

				state = removeShippingMethod( state, currentlyEditingId );

				return {
					...state,
					currentlyEditingId: null,
					currentlyEditingChangedType: false,
					currentlyEditingNew: false,
					creates: [
						...state.creates,
						{
							...currentlyEditingChanges,
							// If the "Enabled" toggle hasn't been modified in the current changes, use the value from the old method
							enabled: isNil( currentlyEditingChanges.enabled )
								? method && method.enabled
								: currentlyEditingChanges.enabled,
							id: nextCreateId( state ),
							_originalId: originalId,
						},
					],
				};
			}

			let found = false;
			const newBucket = state[ bucket ].map( method => {
				if ( isEqual( currentlyEditingId, method.id ) ) {
					found = true;
					// If edits for the method were already in the expected bucket, just update them
					return {
						...method,
						...currentlyEditingChanges,
					};
				}
				return method;
			} );

			if ( ! found ) {
				// If edits for the zone were *not* in the bucket yet, add them
				newBucket.push( { id: currentlyEditingId, ...currentlyEditingChanges } );
			}

			return {
				...state,
				currentlyEditingId: null,
				currentlyEditingChangedType: false,
				currentlyEditingNew: false,
				[ bucket ]: newBucket,
			};
		}

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE:
			return removeShippingMethod( state, action.methodId );

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE: {
			const { methodType, title } = action;
			if ( ! builtInShippingMethods[ methodType ] ) {
				return state;
			}

			const currentlyEditingChanges = {
				...builtInShippingMethods[ methodType ]( undefined, action ),
				id: state.currentlyEditingId,
				title,
				methodType,
				enabled: state.currentlyEditingChanges && state.currentlyEditingChanges.enabled,
			};

			return {
				...state,
				currentlyEditingChangedType: true,
				currentlyEditingChanges,
			};
		}

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE:
			return {
				...state,
				currentlyEditingChanges: {
					...state.currentlyEditingChanges,
					title: action.title,
				},
			};

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_OPENED_ENABLED:
			return {
				...state,
				currentlyEditingChanges: {
					...state.currentlyEditingChanges,
					enabled: action.enabled,
				},
			};

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED: {
			const { methodId, enabled } = action;
			const bucket = getBucket( { id: methodId } );
			const index = findIndex( state[ bucket ], { id: methodId } );

			if ( -1 === index ) {
				return {
					...state,
					[ bucket ]: [
						...state[ bucket ],
						{
							id: methodId,
							enabled,
						},
					],
				};
			}

			const methodState = {
				...state[ bucket ][ index ],
				enabled,
			};

			return {
				...state,
				[ bucket ]: [
					...state[ bucket ].slice( 0, index ),
					methodState,
					...state[ bucket ].slice( index + 1 ),
				],
			};
		}

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED: {
			const {
				data,
				originatingAction: { methodId, method },
			} = action;
			const bucket = getBucket( { id: methodId } );
			const newState = {
				...state,
				currentlyEditingId: null,
			};

			if ( 'creates' === bucket ) {
				const createEdit = find( state.creates, { id: methodId } );
				if ( createEdit ) {
					newState.updates = [
						...state.updates,
						{
							...createEdit,
							id: data.id,
						},
					];
				}
				newState.creates = reject( state[ bucket ], { id: methodId } );
			} else {
				// WCS does partial updates, so only remove the method from the "updates" bucket if it all its fields were updated
				const edit = find( state.updates, { id: methodId } );
				const newEditFields = omit( edit, Object.keys( method ) );
				if ( isEmpty( omit( newEditFields, [ 'id', 'methodType' ] ) ) ) {
					newState.updates = reject( state.updates, { id: methodId } );
				} else {
					const index = findIndex( state.updates, { id: methodId } );
					newState.updates = [
						...state[ bucket ].slice( 0, index ),
						newEditFields,
						...state[ bucket ].slice( index + 1 ),
					];
				}
			}
			return newState;
		}

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETED:
			return {
				...state,
				creates: reject( state.creates, { id: action.originatingAction.methodId } ),
				updates: reject( state.updates, { id: action.originatingAction.methodId } ),
				deletes: reject( state.deletes, { id: action.originatingAction.methodId } ),
				currentlyEditingId: null,
			};

		default: {
			const { methodId, methodType } = action;
			// If the action has something to do with a built-in shipping method, fire its reducer
			if ( methodId && methodType && builtInShippingMethods[ methodType ] ) {
				// Only give the shipping method reducer data about the shipping method itself, not the whole tree
				const methodState = state.currentlyEditingChanges;
				const newMethodState = builtInShippingMethods[ methodType ]( methodState, action );

				if ( newMethodState !== methodState ) {
					return {
						...state,
						currentlyEditingChanges: newMethodState,
					};
				}
			}

			return state;
		}
	}
}

function removeShippingMethod( state, methodId ) {
	const newState = {
		...state,
		currentlyEditingId: null,
	};

	const bucket = getBucket( { id: methodId } );
	if ( 'updates' === bucket ) {
		newState.deletes = [ ...state.deletes, { id: methodId } ];
	}
	newState[ bucket ] = reject( state[ bucket ], { id: methodId } );

	return newState;
}
