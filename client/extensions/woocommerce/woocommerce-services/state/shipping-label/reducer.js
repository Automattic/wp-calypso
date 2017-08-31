/* eslint-disable no-console */
/**
 * External dependencies
 */
import _ from 'lodash';

/**
 * Internal dependencies
 */
import {
	INIT_LABELS,
	SET_IS_FETCHING,
	SET_FETCH_ERROR,
	OPEN_PRINTING_FLOW,
	EXIT_PRINTING_FLOW,
	TOGGLE_STEP,
	UPDATE_ADDRESS_VALUE,
	REMOVE_IGNORE_VALIDATION,
	ADDRESS_NORMALIZATION_IN_PROGRESS,
	SET_NORMALIZED_ADDRESS,
	ADDRESS_NORMALIZATION_COMPLETED,
	SELECT_NORMALIZED_ADDRESS,
	EDIT_ADDRESS,
	CONFIRM_ADDRESS_SUGGESTION,
	UPDATE_PACKAGE_WEIGHT,
	UPDATE_RATE,
	UPDATE_PAPER_SIZE,
	PURCHASE_LABEL_REQUEST,
	PURCHASE_LABEL_RESPONSE,
	SHOW_PRINT_CONFIRMATION,
	RATES_RETRIEVAL_IN_PROGRESS,
	SET_RATES,
	RATES_RETRIEVAL_COMPLETED,
	CLEAR_AVAILABLE_RATES,
	OPEN_REFUND_DIALOG,
	CLOSE_REFUND_DIALOG,
	LABEL_STATUS_RESPONSE,
	REFUND_REQUEST,
	REFUND_RESPONSE,
	OPEN_REPRINT_DIALOG,
	CLOSE_REPRINT_DIALOG,
	CONFIRM_REPRINT,
	OPEN_PACKAGE,
	OPEN_ITEM_MOVE,
	MOVE_ITEM,
	CLOSE_ITEM_MOVE,
	SET_TARGET_PACKAGE,
	ADD_PACKAGE,
	REMOVE_PACKAGE,
	SET_PACKAGE_TYPE,
	SAVE_PACKAGES,
	OPEN_ADD_ITEM,
	CLOSE_ADD_ITEM,
	SET_ADDED_ITEM,
	ADD_ITEMS,
} from './actions';
import getBoxDimensions from 'lib/utils/get-box-dimensions';
import initializeLabelsState from 'lib/initialize-labels-state';

const generateUniqueBoxId = ( keyBase, boxIds ) => {
	for ( let i = 0; i <= boxIds.length; i++ ) {
		if ( -1 === boxIds.indexOf( keyBase + i ) ) {
			return keyBase + i;
		}
	}
};

/* Irons out floating point arithmetic artifacts */
const round = ( n ) => _.round( n, 8 );

const reducers = {};

reducers[ INIT_LABELS ] = ( state, { formData, labelsData, paperSize, storeOptions, paymentMethod, numPaymentMethods } ) => {
	return {
		...state,
		...initializeLabelsState( formData, labelsData, paperSize, storeOptions, paymentMethod, numPaymentMethods ),
	};
};

reducers[ SET_IS_FETCHING ] = ( state, { isFetching } ) => {
	return {
		...state,
		isFetching,
	};
};

reducers[ SET_FETCH_ERROR ] = ( state, { error } ) => {
	return {
		...state,
		error,
	};
};

reducers[ OPEN_PRINTING_FLOW ] = ( state ) => {
	return { ...state,
		showPurchaseDialog: true,
	};
};

reducers[ EXIT_PRINTING_FLOW ] = ( state, { force } ) => {
	if ( ! force && state.form.isSubmitting ) {
		return state;
	}
	return { ...state,
		showPurchaseDialog: false,
		form: { ...state.form,
			isSubmitting: false,
		},
	};
};

reducers[ TOGGLE_STEP ] = ( state, { stepName } ) => {
	return { ...state,
		form: { ...state.form,
			[ stepName ]: { ...state.form[ stepName ],
				expanded: ! state.form[ stepName ].expanded,
			},
		},
	};
};

reducers[ UPDATE_ADDRESS_VALUE ] = ( state, { group, name, value } ) => {
	const newState = { ...state,
		form: { ...state.form,
			[ group ]: { ...state.form[ group ],
				values: { ...state.form[ group ].values,
					[ name ]: value,
				},
				isNormalized: false,
				normalized: null,
			},
		},
	};
	if ( 'country' === name ) {
		return reducers[ UPDATE_ADDRESS_VALUE ]( newState, { group, name: 'state', value: '' } );
	}
	if ( state.form[ group ].ignoreValidation ) {
		newState.form[ group ].ignoreValidation = { ...state.form[ group ].ignoreValidation,
			[ name ]: false,
		};
	}
	return newState;
};

reducers[ REMOVE_IGNORE_VALIDATION ] = ( state, { group } ) => {
	return { ...state,
		form: { ...state.form,
			[ group ]: { ...state.form[ group ],
				ignoreValidation: null,
			},
		},
	};
};

reducers[ ADDRESS_NORMALIZATION_IN_PROGRESS ] = ( state, { group } ) => {
	return { ...state,
		form: { ...state.form,
			[ group ]: { ...state.form[ group ],
				normalizationInProgress: true,
			},
		},
	};
};

reducers[ SET_NORMALIZED_ADDRESS ] = ( state, { group, normalized, isTrivialNormalization } ) => {
	const newState = { ...state,
		form: { ...state.form,
			[ group ]: { ...state.form[ group ],
				selectNormalized: true,
				normalized,
			},
		},
	};
	if ( isTrivialNormalization ) {
		newState.form[ group ].values = normalized;
	}
	return newState;
};

reducers[ ADDRESS_NORMALIZATION_COMPLETED ] = ( state, { group } ) => {
	return { ...state,
		form: { ...state.form,
			[ group ]: { ...state.form[ group ],
				isNormalized: true,
				normalizationInProgress: false,
			},
		},
	};
};

reducers[ SELECT_NORMALIZED_ADDRESS ] = ( state, { group, selectNormalized } ) => {
	return { ...state,
		form: { ...state.form,
			[ group ]: { ...state.form[ group ],
				selectNormalized,
			},
		},
	};
};

reducers[ EDIT_ADDRESS ] = ( state, { group } ) => {
	return { ...state,
		form: { ...state.form,
			[ group ]: { ...state.form[ group ],
				selectNormalized: false,
				normalized: null,
				isNormalized: false,
			},
		},
	};
};

reducers[ CONFIRM_ADDRESS_SUGGESTION ] = ( state, { group } ) => {
	const groupState = {
		...state.form[ group ],
		expanded: false,
	};
	if ( groupState.selectNormalized ) {
		groupState.values = groupState.normalized;
	} else {
		groupState.normalized = groupState.values;
	}
	return { ...state,
		form: { ...state.form,
			[ group ]: groupState,
		},
	};
};

reducers[ UPDATE_PACKAGE_WEIGHT ] = ( state, { packageId, value } ) => {
	const newPackages = { ...state.form.packages.selected };

	newPackages[ packageId ] = {
		...newPackages[ packageId ],
		weight: parseFloat( value ),
		isUserSpecifiedWeight: true,
	};

	return { ...state,
		form: { ...state.form,
			packages: { ...state.form.packages,
				selected: newPackages,
				saved: false,
			},
		},
	};
};

reducers[ OPEN_PACKAGE ] = ( state, { openedPackageId } ) => {
	return { ...state,
		openedPackageId,
	};
};

reducers[ OPEN_ITEM_MOVE ] = ( state, { movedItemIndex } ) => {
	return {
		...state,
		showItemMoveDialog: true,
		targetPackageId: state.openedPackageId,
		movedItemIndex,
	};
};

reducers[ MOVE_ITEM ] = ( state, { originPackageId, movedItemIndex, targetPackageId } ) => {
	if ( -1 === movedItemIndex || originPackageId === targetPackageId || undefined === originPackageId ) {
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
		weight: round( newPackages[ originPackageId ].weight - movedItem.weight ),
	};

	if ( 'individual' === targetPackageId ) {
		//move to an individual packaging
		const packageKeys = Object.keys( newPackages );
		addedPackageId = generateUniqueBoxId( 'client_individual_', packageKeys );
		const { height, length, width, weight } = movedItem;
		newPackages[ addedPackageId ] = {
			height, length, width, weight,
			id: addedPackageId,
			box_id: 'individual',
			items: [ movedItem ],
		};
	} else if ( 'new' === targetPackageId ) {
		//move to an new packaging
		const packageKeys = Object.keys( newPackages );
		addedPackageId = generateUniqueBoxId( 'client_custom_', packageKeys );
		newPackages[ addedPackageId ] = {
			height: 0, length: 0, width: 0, weight: movedItem.weight,
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
			weight: round( newPackages[ targetPackageId ].weight + movedItem.weight ),
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
				values: _.mapValues( newPackages, () => '' ),
				available: {},
			},
		},
	};
};

reducers[ CLOSE_ITEM_MOVE ] = ( state ) => {
	return {
		...state,
		movedItemIndex: -1,
		showItemMoveDialog: false,
	};
};

reducers[ SET_TARGET_PACKAGE ] = ( state, { targetPackageId } ) => {
	return {
		...state,
		targetPackageId,
	};
};

reducers[ OPEN_ADD_ITEM ] = ( state ) => {
	return {
		...state,
		showAddItemDialog: true,
		addedItems: {},
	};
};

reducers[ CLOSE_ADD_ITEM ] = ( state ) => {
	return {
		...state,
		showAddItemDialog: false,
	};
};

reducers[ SET_ADDED_ITEM ] = ( state, { sourcePackageId, movedItemIndex, added } ) => {
	let newItemIndices;
	if ( added ) {
		const itemIndices = state.addedItems[ sourcePackageId ] || [];
		newItemIndices = _.includes( itemIndices, movedItemIndex ) ? itemIndices : [ ...itemIndices, movedItemIndex ];
	} else {
		newItemIndices = _.without( state.addedItems[ sourcePackageId ], movedItemIndex );
	}

	return {
		...state,
		addedItems: { ...state.addedItems, [ sourcePackageId ]: newItemIndices },
	};
};

reducers[ ADD_ITEMS ] = ( state, { targetPackageId } ) => {
	// For each origin package
	_.each( state.addedItems, ( itemIndices, originPackageId ) => {
		// Move items in reverse order of index, to maintain validity as items are removed.
		// e.g. when index 0 is removed from the package, index 1 would become index 0
		_.sortBy( itemIndices, ( i ) => -i ).forEach( ( movedItemIndex ) => {
			state = reducers[ MOVE_ITEM ]( state, { originPackageId, movedItemIndex, targetPackageId } );
		} );
	} );
	return { ...state, showAddItemDialog: false };
};

reducers[ ADD_PACKAGE ] = ( state ) => {
	const newPackages = { ...state.form.packages.selected };
	const packageKeys = Object.keys( newPackages );
	const boxesKeys = Object.keys( state.form.packages.all );
	if ( ! boxesKeys.length ) {
		return state;
	}

	const addedPackageId = generateUniqueBoxId( 'client_custom_', packageKeys );
	const openedPackageId = addedPackageId;

	newPackages[ addedPackageId ] = {
		height: 0, length: 0, width: 0,
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
				values: _.mapValues( newPackages, () => '' ),
				available: {},
			},
		},
	};
};

reducers[ REMOVE_PACKAGE ] = ( state, { packageId } ) => {
	const newPackages = { ...state.form.packages.selected };
	const pckg = newPackages[ packageId ];
	const removedItems = pckg.items;
	delete newPackages[ packageId ];

	const openedPackageId = Object.keys( newPackages )[ 0 ] || '';
	const newOpenedPackage = { ... newPackages[ openedPackageId ] };
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
				values: _.mapValues( newPackages, () => '' ),
				available: {},
			},
		},
	};
};

reducers[ SET_PACKAGE_TYPE ] = ( state, { packageId, boxTypeId } ) => {
	const newPackages = { ...state.form.packages.selected };
	const oldPackage = newPackages[ packageId ];

	const box = state.form.packages.all[ boxTypeId ];
	const weight = round(
		oldPackage.isUserSpecifiedWeight ? oldPackage.weight
			: ( box ? box.box_weight : 0 ) + _.sumBy( oldPackage.items, 'weight' )
	);

	if ( 'not_selected' === boxTypeId ) {
		// This is when no box is selected
		newPackages[ packageId ] = {
			..._.omit( oldPackage, 'service_id' ),
			height: 0,
			length: 0,
			width: 0,
			weight,
			box_id: boxTypeId,
		};
	} else {
		const { length, width, height } = getBoxDimensions( box );
		newPackages[ packageId ] = {
			..._.omit( oldPackage, 'service_id' ),
			height,
			length,
			width,
			weight,
			box_id: boxTypeId,
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
				values: _.mapValues( newPackages, () => '' ),
				available: {},
			},
		},
	};
};

reducers[ SAVE_PACKAGES ] = ( state ) => {
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

reducers[ UPDATE_RATE ] = ( state, { packageId, value } ) => {
	const newRates = { ...state.form.rates.values };
	newRates[ packageId ] = value;

	return { ...state,
		form: { ...state.form,
			rates: { ...state.form.rates,
				values: newRates,
			},
		},
	};
};

reducers[ UPDATE_PAPER_SIZE ] = ( state, { value } ) => {
	return { ...state,
		paperSize: value,
	};
};

reducers[ PURCHASE_LABEL_REQUEST ] = ( state ) => {
	return { ...state,
		form: { ...state.form,
			isSubmitting: true,
		},
	};
};

reducers[ PURCHASE_LABEL_RESPONSE ] = ( state, { response, error } ) => {
	if ( error ) {
		return { ...state,
			form: { ...state.form,
				isSubmitting: false,
			},
		};
	}

	return { ...state,
		labels: [
			...response.map( ( label ) => ( { ...label,
				statusUpdated: true,
			} ) ),
			...state.labels,
		],
	};
};

reducers[ SHOW_PRINT_CONFIRMATION ] = ( state, { printUrl } ) => {
	return { ...state,
		form: { ...state.form,
			needsPrintConfirmation: true,
			printUrl,
		},
	};
};

reducers[ RATES_RETRIEVAL_IN_PROGRESS ] = ( state ) => {
	return { ...state,
		form: { ...state.form,
			rates: { ...state.form.rates,
				retrievalInProgress: true,
			},
		},
	};
};

reducers[ SET_RATES ] = ( state, { rates } ) => {
	return { ...state,
		form: { ...state.form,
			rates: {
				values: _.mapValues( rates, ( rate ) => {
					const selected = _.get( rate, 'rates', [] )
						.find( ( r ) => r.is_selected );

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

reducers[ RATES_RETRIEVAL_COMPLETED ] = ( state ) => {
	return { ...state,
		form: { ...state.form,
			rates: { ...state.form.rates,
				retrievalInProgress: false,
			},
		},
	};
};

reducers[ CLEAR_AVAILABLE_RATES ] = ( state ) => {
	return { ...state,
		form: { ...state.form,
			needsPrintConfirmation: false,
			rates: { ...state.form.rates,
				available: {},
			},
		},
	};
};

reducers[ OPEN_REFUND_DIALOG ] = ( state, { labelId } ) => {
	return { ...state,
		refundDialog: {
			labelId,
		},
	};
};

reducers[ CLOSE_REFUND_DIALOG ] = ( state ) => {
	if ( state.refundDialog.isSubmitting ) {
		return state;
	}
	return { ...state,
		refundDialog: null,
	};
};

reducers[ LABEL_STATUS_RESPONSE ] = ( state, { labelId, response, error } ) => {
	if ( error ) {
		response = {};
	}

	const labelIndex = _.findIndex( state.labels, { label_id: labelId } );
	const labelData = {
		...state.labels[ labelIndex ],
		...response,
		statusUpdated: true,
	};

	const newState = { ...state,
		labels: [ ...state.labels ],
		refreshedLabelStatus: true,
	};
	newState.labels[ labelIndex ] = labelData;
	return newState;
};

reducers[ REFUND_REQUEST ] = ( state ) => {
	return { ...state,
		refundDialog: { ...state.refundDialog,
			isSubmitting: true,
		},
	};
};

reducers[ REFUND_RESPONSE ] = ( state, { response, error } ) => {
	if ( error ) {
		return { ...state,
			refundDialog: {
				...state.refundDialog,
				isSubmitting: false,
			},
		};
	}

	const labelIndex = _.findIndex( state.labels, { label_id: state.refundDialog.labelId } );
	const labelData = {
		...state.labels[ labelIndex ],
		refund: response,
	};

	const newState = { ...state,
		refundDialog: null,
		labels: [ ...state.labels ],
	};
	newState.refundDialog = null;
	newState.labels[ labelIndex ] = labelData;

	return newState;
};

reducers[ OPEN_REPRINT_DIALOG ] = ( state, { labelId } ) => {
	return { ...state,
		reprintDialog: {
			labelId,
		},
	};
};

reducers[ CLOSE_REPRINT_DIALOG ] = ( state ) => {
	return { ...state,
		reprintDialog: null,
	};
};

reducers[ CONFIRM_REPRINT ] = ( state ) => {
	return { ...state,
		reprintDialog: { ...state.reprintDialog,
			isFetching: true,
		},
	};
};

export default ( state = {}, action ) => {
	if ( reducers[ action.type ] ) {
		return reducers[ action.type ]( state, action );
	}
	return state;
};
