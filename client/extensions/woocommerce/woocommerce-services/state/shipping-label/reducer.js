/**
 * External dependencies
 */
import {
	each,
	find,
	findIndex,
	get,
	includes,
	isEqual,
	mapValues,
	omit,
	round,
	sortBy,
	sumBy,
	without,
} from 'lodash';

/**
 * Internal dependencies
 */
import { keyedReducer } from 'state/utils';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_INIT,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_IS_FETCHING,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_FETCH_ERROR,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EXIT_PRINTING_FLOW,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_ADDRESS_VALUE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_IGNORE_VALIDATION,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_IN_PROGRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_COMPLETED,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SELECT_NORMALIZED_ADDRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EDIT_ADDRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EDIT_UNVERIFIABLE_ADDRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_ADDRESS_SUGGESTION,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PACKAGE_WEIGHT,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_SIGNATURE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_RATE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PAPER_SIZE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_RESPONSE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SHOW_PRINT_CONFIRMATION,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_IN_PROGRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RATES,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_COMPLETED,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLEAR_AVAILABLE_RATES,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REFUND_DIALOG,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REFUND_DIALOG,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_STATUS_RESPONSE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_RESPONSE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REPRINT_DIALOG,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REPRINT_DIALOG_READY,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REPRINT_DIALOG_ERROR,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REPRINT_DIALOG,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_REPRINT,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_DETAILS_DIALOG,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_DETAILS_DIALOG,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PACKAGE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ITEM_MOVE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_MOVE_ITEM,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ITEM_MOVE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_TARGET_PACKAGE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_PACKAGE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_PACKAGE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SAVE_PACKAGES,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ADD_ITEM,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ADD_ITEM,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ADDED_ITEM,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_ITEMS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_EMAIL_DETAILS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_FULFILL_ORDER,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CONTENTS_TYPE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CONTENTS_EXPLANATION,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RESTRICTION_TYPE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RESTRICTION_COMMENTS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ABANDON_ON_NON_DELIVERY,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ITN,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_DESCRIPTION,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_TARIFF_NUMBER,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_WEIGHT,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_VALUE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_ORIGIN_COUNTRY,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SAVE_CUSTOMS,
} from '../action-types';
import { WOOCOMMERCE_ORDER_UPDATE_SUCCESS } from 'woocommerce/state/action-types';
import getBoxDimensions from 'woocommerce/woocommerce-services/lib/utils/get-box-dimensions';
import initializeLabelsState from 'woocommerce/woocommerce-services/lib/initialize-labels-state';

const generateUniqueBoxId = ( keyBase, boxIds ) => {
	for ( let i = 0; i <= boxIds.length; i++ ) {
		if ( -1 === boxIds.indexOf( keyBase + i ) ) {
			return keyBase + i;
		}
	}
};

const reducers = {};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_INIT ] = ( state, actionData ) => {
	return {
		...state,
		...initializeLabelsState( omit( actionData, 'type', 'siteId' ) ),
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_IS_FETCHING ] = ( state, { isFetching } ) => {
	return {
		...state,
		isFetching,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_FETCH_ERROR ] = ( state, { error } ) => {
	return {
		...state,
		error,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW ] = ( state ) => {
	return {
		...state,
		showPurchaseDialog: true,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EXIT_PRINTING_FLOW ] = ( state, { force } ) => {
	if ( ! force && state.form.isSubmitting ) {
		return state;
	}
	return {
		...state,
		showPurchaseDialog: false,
		form: {
			...state.form,
			isSubmitting: false,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP ] = ( state, { stepName } ) => {
	return {
		...state,
		form: {
			...state.form,
			[ stepName ]: {
				...state.form[ stepName ],
				expanded: ! state.form[ stepName ].expanded,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_ADDRESS_VALUE ] = (
	state,
	{ group, name, value }
) => {
	const newState = {
		...state,
		form: {
			...state.form,
			[ group ]: {
				...state.form[ group ],
				values: {
					...state.form[ group ].values,
					[ name ]: value,
				},
				isNormalized: false,
				isUnverifiable: false,
				normalized: null,
			},
		},
	};
	if ( 'country' === name ) {
		return reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_ADDRESS_VALUE ]( newState, {
			group,
			name: 'state',
			value: '',
		} );
	}
	if ( state.form[ group ].ignoreValidation ) {
		newState.form[ group ].ignoreValidation = {
			...state.form[ group ].ignoreValidation,
			[ name ]: false,
		};
	}
	return newState;
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_IGNORE_VALIDATION ] = ( state, { group } ) => {
	return {
		...state,
		form: {
			...state.form,
			[ group ]: {
				...state.form[ group ],
				ignoreValidation: null,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_IN_PROGRESS ] = (
	state,
	{ group }
) => {
	return {
		...state,
		form: {
			...state.form,
			[ group ]: {
				...state.form[ group ],
				normalizationInProgress: true,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_COMPLETED ] = (
	state,
	{ group, requestSuccess, fieldErrors, normalized, isTrivialNormalization }
) => {
	const newState = {
		...state,
		form: {
			...state.form,
			[ group ]: {
				...state.form[ group ],
				isNormalized: requestSuccess,
				normalizationInProgress: false,
				fieldErrors,
				selectNormalized: requestSuccess && ! fieldErrors,
				normalized,
			},
		},
	};
	if ( isTrivialNormalization ) {
		newState.form[ group ].values = normalized;
	}
	return newState;
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SELECT_NORMALIZED_ADDRESS ] = (
	state,
	{ group, selectNormalized }
) => {
	return {
		...state,
		form: {
			...state.form,
			[ group ]: {
				...state.form[ group ],
				selectNormalized,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EDIT_ADDRESS ] = ( state, { group } ) => {
	return {
		...state,
		form: {
			...state.form,
			[ group ]: {
				...state.form[ group ],
				selectNormalized: false,
				normalized: null,
				isNormalized: false,
				isUnverifiable: false,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EDIT_UNVERIFIABLE_ADDRESS ] = (
	state,
	{ group }
) => {
	return {
		...state,
		form: {
			...state.form,
			[ group ]: {
				...state.form[ group ],
				selectNormalized: false,
				normalized: null,
				isNormalized: false,
				isUnverifiable: true,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_ADDRESS_SUGGESTION ] = (
	state,
	{ group }
) => {
	const groupState = {
		...state.form[ group ],
		expanded: false,

		// No matter whether the suggestion is being used or not,
		// after this action the address must be marked as normalized.
		isNormalized: true,
	};

	if ( groupState.selectNormalized ) {
		groupState.values = groupState.normalized;
	} else {
		groupState.normalized = groupState.values;
	}
	return {
		...state,
		form: {
			...state.form,
			[ group ]: groupState,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PACKAGE_WEIGHT ] = (
	state,
	{ packageId, value }
) => {
	const newPackages = { ...state.form.packages.selected };

	newPackages[ packageId ] = {
		...newPackages[ packageId ],
		weight: parseFloat( value ),
		isUserSpecifiedWeight: true,
	};

	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				selected: newPackages,
				saved: false,
			},
			rates: {
				...state.form.rates,
				values: {
					...state.form.rates.values,
					[ packageId ]: '',
				},
				available: {},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_SIGNATURE ] = (
	state,
	{ packageId, signature }
) => {
	const newPackages = { ...state.form.packages.selected };

	newPackages[ packageId ] = {
		...newPackages[ packageId ],
		signature,
	};

	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				selected: newPackages,
				saved: false,
			},
			rates: {
				...state.form.rates,
				values: {
					...state.form.rates.values,
					[ packageId ]: '',
				},
				available: {},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PACKAGE ] = ( state, { openedPackageId } ) => {
	return {
		...state,
		openedPackageId,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ITEM_MOVE ] = ( state, { movedItemIndex } ) => {
	return {
		...state,
		showItemMoveDialog: true,
		targetPackageId: state.openedPackageId,
		movedItemIndex,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_MOVE_ITEM ] = (
	state,
	{ originPackageId, movedItemIndex, targetPackageId }
) => {
	if (
		-1 === movedItemIndex ||
		originPackageId === targetPackageId ||
		undefined === originPackageId
	) {
		return state;
	}

	const newPackages = { ...state.form.packages.selected };
	let addedPackageId = null;
	let openedPackageId = state.openedPackageId;

	const originItems = [ ...newPackages[ originPackageId ].items ];
	const movedItem = originItems.splice( movedItemIndex, 1 )[ 0 ];

	newPackages[ originPackageId ] = {
		...newPackages[ originPackageId ],
		items: originItems,
		weight: round( newPackages[ originPackageId ].weight - movedItem.weight, 8 ),
	};

	if ( 'individual' === targetPackageId ) {
		//move to an individual packaging
		const packageKeys = Object.keys( newPackages );
		addedPackageId = generateUniqueBoxId( 'client_individual_', packageKeys );
		const { height, length, width, weight } = movedItem;
		newPackages[ addedPackageId ] = {
			height,
			length,
			width,
			weight,
			id: addedPackageId,
			box_id: 'individual',
			items: [ movedItem ],
		};
	} else if ( 'new' === targetPackageId ) {
		//move to an new packaging
		const packageKeys = Object.keys( newPackages );
		addedPackageId = generateUniqueBoxId( 'client_custom_', packageKeys );
		newPackages[ addedPackageId ] = {
			height: 0,
			length: 0,
			width: 0,
			weight: movedItem.weight,
			id: addedPackageId,
			box_id: 'not_selected',
			items: [ movedItem ],
		};
	} else {
		//move to an existing package
		const targetItems = [ ...newPackages[ targetPackageId ].items ];
		targetItems.push( movedItem );
		newPackages[ targetPackageId ] = {
			...newPackages[ targetPackageId ],
			items: targetItems,
			weight: round( newPackages[ targetPackageId ].weight + movedItem.weight, 8 ),
		};
	}

	if ( 0 === newPackages[ originPackageId ].items.length ) {
		delete newPackages[ originPackageId ];
		openedPackageId = addedPackageId || targetPackageId;
	}

	return {
		...state,
		openedPackageId,
		addedPackageId,
		movedItemIndex: -1,
		showItemMoveDialog: false,
		form: {
			...state.form,
			needsPrintConfirmation: false,
			packages: {
				...state.form.packages,
				selected: newPackages,
				saved: false,
			},
			rates: {
				...state.form.rates,
				values: mapValues( newPackages, () => '' ),
				available: {},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ITEM_MOVE ] = ( state ) => {
	return {
		...state,
		movedItemIndex: -1,
		showItemMoveDialog: false,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_TARGET_PACKAGE ] = (
	state,
	{ targetPackageId }
) => {
	return {
		...state,
		targetPackageId,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ADD_ITEM ] = ( state ) => {
	return {
		...state,
		showAddItemDialog: true,
		addedItems: {},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ADD_ITEM ] = ( state ) => {
	return {
		...state,
		showAddItemDialog: false,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ADDED_ITEM ] = (
	state,
	{ sourcePackageId, movedItemIndex, added }
) => {
	let newItemIndices;
	if ( added ) {
		const itemIndices = state.addedItems[ sourcePackageId ] || [];
		newItemIndices = includes( itemIndices, movedItemIndex )
			? itemIndices
			: [ ...itemIndices, movedItemIndex ];
	} else {
		newItemIndices = without( state.addedItems[ sourcePackageId ], movedItemIndex );
	}

	return {
		...state,
		addedItems: { ...state.addedItems, [ sourcePackageId ]: newItemIndices },
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_ITEMS ] = ( state, { targetPackageId } ) => {
	// For each origin package
	each( state.addedItems, ( itemIndices, originPackageId ) => {
		// Move items in reverse order of index, to maintain validity as items are removed.
		// e.g. when index 0 is removed from the package, index 1 would become index 0
		sortBy( itemIndices, ( i ) => -i ).forEach( ( movedItemIndex ) => {
			state = reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_MOVE_ITEM ]( state, {
				originPackageId,
				movedItemIndex,
				targetPackageId,
			} );
		} );
	} );
	return { ...state, showAddItemDialog: false };
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_PACKAGE ] = ( state ) => {
	const newPackages = { ...state.form.packages.selected };
	const packageKeys = Object.keys( newPackages );

	const addedPackageId = generateUniqueBoxId( 'client_custom_', packageKeys );
	const openedPackageId = addedPackageId;

	newPackages[ addedPackageId ] = {
		height: 0,
		length: 0,
		width: 0,
		id: addedPackageId,
		weight: 0,
		box_id: 'not_selected',
		items: [],
	};

	return {
		...state,
		openedPackageId,
		addedPackageId,
		form: {
			...state.form,
			needsPrintConfirmation: false,
			packages: {
				...state.form.packages,
				selected: newPackages,
				saved: false,
			},
			rates: {
				...state.form.rates,
				values: mapValues( newPackages, () => '' ),
				available: {},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_PACKAGE ] = ( state, { packageId } ) => {
	const newPackages = { ...state.form.packages.selected };
	const pckg = newPackages[ packageId ];
	const removedItems = pckg.items;
	delete newPackages[ packageId ];

	const openedPackageId = Object.keys( newPackages )[ 0 ] || '';
	const newOpenedPackage = { ...newPackages[ openedPackageId ] };
	newOpenedPackage.items = newOpenedPackage.items.concat( removedItems );
	newPackages[ openedPackageId ] = newOpenedPackage;

	return {
		...state,
		openedPackageId,
		form: {
			...state.form,
			needsPrintConfirmation: false,
			packages: {
				...state.form.packages,
				selected: newPackages,
				saved: false,
			},
			rates: {
				...state.form.rates,
				values: mapValues( newPackages, () => '' ),
				available: {},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE ] = (
	state,
	{ box, packageId, boxTypeId }
) => {
	const newPackages = { ...state.form.packages.selected };
	const oldPackage = newPackages[ packageId ];
	const weight = round(
		oldPackage.isUserSpecifiedWeight
			? oldPackage.weight
			: ( box ? box.box_weight : 0 ) + sumBy( oldPackage.items, 'weight' ),
		8
	);

	if ( 'not_selected' === boxTypeId ) {
		// This is when no box is selected
		newPackages[ packageId ] = {
			...omit( oldPackage, 'service_id' ),
			height: 0,
			length: 0,
			width: 0,
			weight,
			box_id: boxTypeId,
		};
	} else {
		const { length, width, height } = getBoxDimensions( box );
		newPackages[ packageId ] = {
			...omit( oldPackage, 'service_id' ),
			height,
			length,
			width,
			weight,
			box_id: boxTypeId,
			is_letter: box.is_letter,
		};
	}

	return {
		...state,
		form: {
			...state.form,
			needsPrintConfirmation: false,
			packages: {
				...state.form.packages,
				selected: newPackages,
				saved: false,
			},
			rates: {
				...state.form.rates,
				values: mapValues( newPackages, () => '' ),
				available: {},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SAVE_PACKAGES ] = ( state ) => {
	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				saved: true,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CONTENTS_TYPE ] = (
	state,
	{ packageId, contentsType }
) => {
	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				selected: {
					...state.form.packages.selected,
					[ packageId ]: {
						...state.form.packages.selected[ packageId ],
						contentsType,
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CONTENTS_EXPLANATION ] = (
	state,
	{ packageId, contentsExplanation }
) => {
	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				selected: {
					...state.form.packages.selected,
					[ packageId ]: {
						...state.form.packages.selected[ packageId ],
						contentsExplanation,
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RESTRICTION_TYPE ] = (
	state,
	{ packageId, restrictionType }
) => {
	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				selected: {
					...state.form.packages.selected,
					[ packageId ]: {
						...state.form.packages.selected[ packageId ],
						restrictionType,
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RESTRICTION_COMMENTS ] = (
	state,
	{ packageId, restrictionComments }
) => {
	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				selected: {
					...state.form.packages.selected,
					[ packageId ]: {
						...state.form.packages.selected[ packageId ],
						restrictionComments,
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ABANDON_ON_NON_DELIVERY ] = (
	state,
	{ packageId, abandonOnNonDelivery }
) => {
	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				selected: {
					...state.form.packages.selected,
					[ packageId ]: {
						...state.form.packages.selected[ packageId ],
						abandonOnNonDelivery: Boolean( abandonOnNonDelivery ),
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ITN ] = ( state, { packageId, itn } ) => {
	return {
		...state,
		form: {
			...state.form,
			packages: {
				...state.form.packages,
				selected: {
					...state.form.packages.selected,
					[ packageId ]: {
						...state.form.packages.selected[ packageId ],
						itn,
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_DESCRIPTION ] = (
	state,
	{ productId, description }
) => {
	return {
		...state,
		form: {
			...state.form,
			customs: {
				...state.form.customs,
				items: {
					...state.form.customs.items,
					[ productId ]: {
						...state.form.customs.items[ productId ],
						description,
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_TARIFF_NUMBER ] = (
	state,
	{ productId, tariffNumber }
) => {
	return {
		...state,
		form: {
			...state.form,
			customs: {
				...state.form.customs,
				items: {
					...state.form.customs.items,
					[ productId ]: {
						...state.form.customs.items[ productId ],
						tariffNumber: tariffNumber.replace( /\D/g, '' ).substr( 0, 6 ),
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_WEIGHT ] = (
	state,
	{ productId, weight }
) => {
	return {
		...state,
		form: {
			...state.form,
			customs: {
				...state.form.customs,
				items: {
					...state.form.customs.items,
					[ productId ]: {
						...state.form.customs.items[ productId ],
						weight,
					},
				},
				ignoreWeightValidation: {
					...state.form.customs.ignoreWeightValidation,
					[ productId ]: false,
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_VALUE ] = (
	state,
	{ productId, value }
) => {
	return {
		...state,
		form: {
			...state.form,
			customs: {
				...state.form.customs,
				items: {
					...state.form.customs.items,
					[ productId ]: {
						...state.form.customs.items[ productId ],
						value,
					},
				},
				ignoreValueValidation: {
					...state.form.customs.ignoreValueValidation,
					[ productId ]: false,
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_ORIGIN_COUNTRY ] = (
	state,
	{ productId, originCountry }
) => {
	return {
		...state,
		form: {
			...state.form,
			customs: {
				...state.form.customs,
				items: {
					...state.form.customs.items,
					[ productId ]: {
						...state.form.customs.items[ productId ],
						originCountry,
					},
				},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SAVE_CUSTOMS ] = ( state ) => {
	return {
		...state,
		form: {
			...state.form,
			customs: {
				...state.form.customs,
				items: mapValues( state.form.customs.items, ( item ) => ( {
					...item,
					tariffNumber: item.tariffNumber || '',
				} ) ),
				ignoreWeightValidation: {},
				ignoreValueValidation: {},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_RATE ] = ( state, { packageId, value } ) => {
	const newRates = { ...state.form.rates.values };
	newRates[ packageId ] = value;

	return {
		...state,
		form: {
			...state.form,
			rates: {
				...state.form.rates,
				values: newRates,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PAPER_SIZE ] = ( state, { value } ) => {
	return {
		...state,
		paperSize: value,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_EMAIL_DETAILS ] = ( state, { value } ) => {
	return {
		...state,
		emailDetails: value,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_FULFILL_ORDER ] = ( state, { value } ) => {
	return {
		...state,
		fulfillOrder: value,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_REQUEST ] = ( state ) => {
	return {
		...state,
		form: {
			...state.form,
			isSubmitting: true,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_RESPONSE ] = (
	state,
	{ response, error }
) => {
	if ( error ) {
		return {
			...state,
			form: {
				...state.form,
				isSubmitting: false,
			},
		};
	}

	return {
		...state,
		labels: [
			...response.map( ( label ) => ( {
				...label,
				statusUpdated: true,
			} ) ),
			...state.labels,
		],
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SHOW_PRINT_CONFIRMATION ] = (
	state,
	{ fileData, labels }
) => {
	return {
		...state,
		form: {
			...state.form,
			needsPrintConfirmation: true,
			fileData,
			labelsToPrint: labels,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_IN_PROGRESS ] = (
	state,
	{ requestData }
) => {
	return {
		...state,
		form: {
			...state.form,
			rates: {
				...state.form.rates,
				retrievalInProgress: requestData,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RATES ] = ( state, { rates, requestData } ) => {
	if ( ! isEqual( requestData, state.form.rates.retrievalInProgress ) ) {
		return state;
	}

	return {
		...state,
		form: {
			...state.form,
			rates: {
				values: mapValues( rates, ( rate ) => {
					const packageRates = get( rate, 'rates', [] );
					const selected =
						packageRates.length === 1
							? packageRates[ 0 ]
							: find( packageRates, ( r ) => r.is_selected );

					if ( selected ) {
						return selected.service_id;
					}

					return '';
				} ),
				available: rates,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_COMPLETED ] = (
	state,
	{ requestData }
) => {
	if ( ! isEqual( requestData, state.form.rates.retrievalInProgress ) ) {
		return state;
	}

	return {
		...state,
		form: {
			...state.form,
			rates: {
				...state.form.rates,
				retrievalInProgress: null,
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLEAR_AVAILABLE_RATES ] = ( state ) => {
	return {
		...state,
		form: {
			...state.form,
			needsPrintConfirmation: false,
			rates: {
				...state.form.rates,
				available: {},
			},
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REFUND_DIALOG ] = ( state, { labelId } ) => {
	return {
		...state,
		refundDialog: {
			labelId,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REFUND_DIALOG ] = ( state ) => {
	if ( state.refundDialog.isSubmitting ) {
		return state;
	}
	return {
		...state,
		refundDialog: null,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_STATUS_RESPONSE ] = (
	state,
	{ labelId, response, error }
) => {
	if ( error ) {
		response = {};
	}

	const labelIndex = findIndex( state.labels, { label_id: labelId } );
	const labelData = {
		...state.labels[ labelIndex ],
		...response,
		statusUpdated: true,
	};

	const newState = {
		...state,
		labels: [ ...state.labels ],
		refreshedLabelStatus: true,
	};
	newState.labels[ labelIndex ] = labelData;
	return newState;
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_REQUEST ] = ( state ) => {
	return {
		...state,
		refundDialog: {
			...state.refundDialog,
			isSubmitting: true,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_RESPONSE ] = (
	state,
	{ response, error }
) => {
	if ( error ) {
		return {
			...state,
			refundDialog: {
				...state.refundDialog,
				isSubmitting: false,
			},
		};
	}

	const labelIndex = findIndex( state.labels, { label_id: state.refundDialog.labelId } );
	const labelData = {
		...state.labels[ labelIndex ],
		refund: response,
	};

	const newState = {
		...state,
		refundDialog: null,
		labels: [ ...state.labels ],
	};
	newState.labels[ labelIndex ] = labelData;

	return newState;
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REPRINT_DIALOG ] = ( state, { labelId } ) => {
	return {
		...state,
		reprintDialog: {
			labelId,
			isFetching: true,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REPRINT_DIALOG_READY ] = (
	state,
	{ labelId, fileData }
) => {
	if ( get( state, 'reprintDialog.labelId' ) !== labelId ) {
		return state;
	}
	return {
		...state,
		reprintDialog: {
			labelId,
			fileData,
			isFetching: false,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REPRINT_DIALOG_ERROR ] = ( state, { labelId } ) => {
	if ( get( state, 'reprintDialog.labelId' ) !== labelId ) {
		return state;
	}
	return {
		...state,
		reprintDialog: {
			labelId,
			isFetching: false,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REPRINT_DIALOG ] = ( state ) => {
	return {
		...state,
		reprintDialog: null,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_REPRINT ] = ( state ) => {
	return {
		...state,
		reprintDialog: {
			...state.reprintDialog,
			isFetching: true,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_DETAILS_DIALOG ] = ( state, { labelId } ) => {
	return {
		...state,
		detailsDialog: {
			labelId,
		},
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_DETAILS_DIALOG ] = ( state ) => {
	return {
		...state,
		detailsDialog: null,
	};
};

// Reset the state when the order changes
reducers[ WOOCOMMERCE_ORDER_UPDATE_SUCCESS ] = () => {
	return initializeLabelsState();
};

export default keyedReducer( 'orderId', ( state = initializeLabelsState(), action ) => {
	if ( reducers[ action.type ] ) {
		return reducers[ action.type ]( state, action );
	}
	return state;
} );
