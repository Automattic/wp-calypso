/* eslint-disable no-console */
/* eslint-disable wpcalypso/i18n-mismatched-placeholders */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import {
	every,
	fill,
	filter,
	find,
	first,
	flatten,
	includes,
	isBoolean,
	isEqual,
	map,
	noop,
	pick,
	sumBy,
	uniqBy,
} from 'lodash';

/**
 * Internal dependencies
 */
import * as api from 'woocommerce/woocommerce-services/api';
import printDocument from 'woocommerce/woocommerce-services/lib/utils/print-document';
import getPDFSupport from 'woocommerce/woocommerce-services/lib/utils/pdf-support';
import * as NoticeActions from 'state/notices/actions';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import normalizeAddress from './normalize-address';
import getRates from './get-rates';
import { getPrintURL } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import {
	getFirstErroneousStep,
	getShippingLabel,
	getFormErrors,
	shouldFulfillOrder,
	shouldEmailDetails,
	isCustomsFormRequired,
} from './selectors';
import { createNote } from 'woocommerce/state/sites/orders/notes/actions';
import { saveOrder } from 'woocommerce/state/sites/orders/actions';
import { getAllPackageDefinitions } from 'woocommerce/woocommerce-services/state/packages/selectors';
import { getEmailReceipts } from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import getAddressValues from 'woocommerce/woocommerce-services/lib/utils/get-address-values';

import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_INIT,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_IS_FETCHING,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_FETCH_ERROR,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EXIT_PRINTING_FLOW,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_ADDRESS_VALUE,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_IGNORE_VALIDATION,
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
} from '../action-types.js';

const PRINTING_FAILED_NOTICE_ID = 'label-image-download-failed';
const PRINTING_IN_PROGRESS_NOTICE_ID = 'label-image-download-printing';

export const fetchLabelsData = ( orderId, siteId ) => ( dispatch ) => {
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_IS_FETCHING,
		orderId,
		siteId,
		isFetching: true,
	} );

	api
		.get( siteId, api.url.orderLabels( orderId ) )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_INIT,
				siteId,
				orderId,
				...data,
			} );
		} )
		.catch( ( error ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_FETCH_ERROR,
				orderId,
				siteId,
				error: true,
			} );
			console.error( error ); // eslint-disable-line no-console
		} )
		.then( () =>
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_IS_FETCHING,
				orderId,
				siteId,
				isFetching: false,
			} )
		);
};

export const toggleStep = ( orderId, siteId, stepName ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
		siteId,
		orderId,
		stepName,
	};
};

const waitForAllPromises = ( promises ) => {
	// Thin wrapper over Promise.all, that makes the Promise chain wait for all the promises
	// to be completed, even if one of them is rejected.
	return Promise.all( promises.map( ( p ) => p.catch( ( e ) => e ) ) );
};

const expandFirstErroneousStep = ( orderId, siteId, dispatch, getState ) => {
	const state = getState();
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const form = shippingLabel.form;

	const step = getFirstErroneousStep( state, orderId, siteId );
	if ( step && ! form[ step ].expanded ) {
		dispatch( toggleStep( orderId, siteId, step ) );
	}
};

export const submitStep = ( orderId, siteId, stepName ) => ( dispatch, getState ) => {
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
		stepName,
		siteId,
		orderId,
	} );
	expandFirstErroneousStep( orderId, siteId, dispatch, getState );
};

export const convertToApiPackage = ( pckg, customsItems ) => {
	const apiPckg = pick( pckg, [
		'id',
		'box_id',
		'service_id',
		'length',
		'width',
		'height',
		'weight',
		'signature',
		'is_letter',
	] );
	if ( customsItems ) {
		apiPckg.contents_type = pckg.contentsType || 'merchandise';
		if ( 'other' === pckg.contentsType ) {
			apiPckg.contents_explanation = pckg.contentsExplanation;
		}
		apiPckg.restriction_type = pckg.restrictionType || 'none';
		if ( 'other' === pckg.restrictionType ) {
			apiPckg.restriction_comments = pckg.restrictionComments;
		}
		apiPckg.non_delivery_option = pckg.abandonOnNonDelivery ? 'abandon' : 'return';
		apiPckg.itn = pckg.itn || '';

		apiPckg.items = uniqBy( pckg.items, 'product_id' ).map( ( { product_id } ) => {
			const quantity = sumBy( filter( pckg.items, { product_id } ), 'quantity' );

			return {
				description: customsItems[ product_id ].description,
				quantity,
				value: quantity * customsItems[ product_id ].value,
				weight: quantity * customsItems[ product_id ].weight,
				hs_tariff_number: customsItems[ product_id ].tariffNumber || '',
				origin_country: customsItems[ product_id ].originCountry,
				product_id,
			};
		} );
	}
	return apiPckg;
};

export const clearAvailableRates = ( orderId, siteId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLEAR_AVAILABLE_RATES, orderId, siteId };
};

/**
 * Checks the form for errors, and if there are none, fetches the label rates. Otherwise expands the first erroneous step
 *
 * @param {number} orderId order ID
 * @param {number} siteId site ID
 * @param {Function} dispatch dispatch function
 * @param {Function} getState getState function
 */
const tryGetLabelRates = ( orderId, siteId, dispatch, getState ) => {
	const state = getState();
	const erroneousStep = getFirstErroneousStep( state, orderId, siteId );
	if ( erroneousStep && 'rates' !== erroneousStep ) {
		expandFirstErroneousStep( orderId, siteId, dispatch, getState );
		return;
	}

	const formState = getShippingLabel( state, orderId, siteId ).form;
	const { origin, destination, packages, customs } = formState;

	dispatch( NoticeActions.removeNotice( 'wcs-label-rates' ) );

	const customsItems = isCustomsFormRequired( getState(), orderId, siteId ) ? customs.items : null;
	const apiPackages = map( packages.selected, ( pckg ) =>
		convertToApiPackage( pckg, customsItems )
	);
	getRates( orderId, siteId, dispatch, origin.values, destination.values, apiPackages )
		.then( () => expandFirstErroneousStep( orderId, siteId, dispatch, getState ) )
		.catch( ( error ) => {
			console.error( error );
			dispatch(
				NoticeActions.errorNotice( error.toString(), {
					id: 'wcs-label-rates',
					button: translate( 'Retry' ),
					onClick: () => tryGetLabelRates( orderId, siteId, dispatch, getState ),
				} )
			);
		} );
};

export const openPrintingFlow = ( orderId, siteId ) => ( dispatch, getState ) => {
	const state = getShippingLabel( getState(), orderId, siteId );
	const form = state.form;
	const { origin, destination } = form;
	const errors = getFormErrors( getState(), orderId, siteId );
	const promisesQueue = [];

	if (
		! origin.ignoreValidation &&
		! hasNonEmptyLeaves( errors.origin ) &&
		! origin.isNormalized &&
		! origin.normalizationInProgress
	) {
		promisesQueue.push( normalizeAddress( orderId, siteId, dispatch, origin.values, 'origin' ) );
	}

	if ( origin.ignoreValidation || hasNonEmptyLeaves( errors.origin ) ) {
		dispatch( toggleStep( orderId, siteId, 'origin' ) );
	}

	if (
		! destination.ignoreValidation &&
		! hasNonEmptyLeaves( errors.destination ) &&
		! destination.isNormalized &&
		! destination.normalizationInProgress
	) {
		promisesQueue.push(
			normalizeAddress( orderId, siteId, dispatch, destination.values, 'destination' )
		);
	}

	if ( destination.ignoreValidation || hasNonEmptyLeaves( errors.destination ) ) {
		dispatch( toggleStep( orderId, siteId, 'destination' ) );
	}

	waitForAllPromises( promisesQueue ).then( () =>
		tryGetLabelRates( orderId, siteId, dispatch, getState )
	);

	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW, orderId, siteId } );
};

export const exitPrintingFlow = ( orderId, siteId, force ) => ( dispatch, getState ) => {
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EXIT_PRINTING_FLOW,
		orderId,
		siteId,
		force,
	} );

	const form = getShippingLabel( getState(), orderId, siteId ).form;

	if ( form.needsPrintConfirmation ) {
		dispatch( clearAvailableRates( orderId, siteId ) );
	}
};

export const updateAddressValue = ( orderId, siteId, group, name, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_ADDRESS_VALUE,
		siteId,
		orderId,
		group,
		name,
		value,
	};
};

export const selectNormalizedAddress = ( orderId, siteId, group, selectNormalized ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SELECT_NORMALIZED_ADDRESS,
		siteId,
		orderId,
		group,
		selectNormalized,
	};
};

export const editAddress = ( orderId, siteId, group ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EDIT_ADDRESS,
		siteId,
		orderId,
		group,
	};
};

export const editUnverifiableAddress = ( orderId, siteId, group ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EDIT_UNVERIFIABLE_ADDRESS,
		siteId,
		orderId,
		group,
	};
};

export const removeIgnoreValidation = ( orderId, siteId, group ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_IGNORE_VALIDATION,
		siteId,
		orderId,
		group,
	};
};

export const confirmAddressSuggestion = ( orderId, siteId, group ) => ( dispatch, getState ) => {
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_ADDRESS_SUGGESTION,
		siteId,
		orderId,
		group,
	} );

	tryGetLabelRates( orderId, siteId, dispatch, getState );
};

export const submitAddressForNormalization = ( orderId, siteId, group ) => (
	dispatch,
	getState
) => {
	const handleNormalizeResponse = () => {
		const { values, normalized, expanded } = getShippingLabel( getState(), orderId, siteId ).form[
			group
		];

		if ( isEqual( values, normalized ) ) {
			if ( expanded ) {
				dispatch( toggleStep( orderId, siteId, group ) );
			}

			tryGetLabelRates( orderId, siteId, dispatch, getState );
		}
	};

	let state = getShippingLabel( getState(), orderId, siteId ).form[ group ];
	if ( state.ignoreValidation ) {
		dispatch( removeIgnoreValidation( orderId, siteId, group ) );
		const errors = getFormErrors( getState(), orderId, siteId );
		if ( hasNonEmptyLeaves( errors[ group ] ) ) {
			return;
		}
		state = getShippingLabel( getState(), orderId, siteId ).form[ group ];
	}

	// No `catch` is needed here: `normalizeAddress` already generates a notice.
	return normalizeAddress(
		orderId,
		siteId,
		dispatch,
		getShippingLabel( getState(), orderId, siteId ).form[ group ].values,
		group
	).then( handleNormalizeResponse );
};

export const updatePackageWeight = ( orderId, siteId, packageId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PACKAGE_WEIGHT,
		siteId,
		orderId,
		packageId,
		value,
	};
};

export const setPackageSignature = ( orderId, siteId, packageId, signature ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_SIGNATURE,
		siteId,
		orderId,
		packageId,
		signature,
	};
};

export const openPackage = ( orderId, siteId, openedPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PACKAGE,
		siteId,
		orderId,
		openedPackageId,
	};
};

export const openItemMove = ( orderId, siteId, movedItemIndex ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ITEM_MOVE,
		siteId,
		orderId,
		movedItemIndex,
	};
};

export const moveItem = ( orderId, siteId, originPackageId, movedItemIndex, targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_MOVE_ITEM,
		siteId,
		orderId,
		originPackageId,
		movedItemIndex,
		targetPackageId,
	};
};

export const closeItemMove = ( orderId, siteId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ITEM_MOVE,
		siteId,
		orderId,
	};
};

export const setTargetPackage = ( orderId, siteId, targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_TARGET_PACKAGE,
		targetPackageId,
		siteId,
		orderId,
	};
};

export const openAddItem = ( orderId, siteId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ADD_ITEM,
		siteId,
		orderId,
	};
};

export const closeAddItem = ( orderId, siteId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ADD_ITEM,
		siteId,
		orderId,
	};
};

export const setAddedItem = ( orderId, siteId, sourcePackageId, movedItemIndex, added ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ADDED_ITEM,
		siteId,
		orderId,
		sourcePackageId,
		movedItemIndex,
		added,
	};
};

export const addItems = ( orderId, siteId, targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_ITEMS,
		siteId,
		orderId,
		targetPackageId,
	};
};

export const addPackage = ( orderId, siteId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_PACKAGE,
		siteId,
		orderId,
	};
};

export const removePackage = ( orderId, siteId, packageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_PACKAGE,
		siteId,
		orderId,
		packageId,
	};
};

export const setPackageType = ( orderId, siteId, packageId, boxTypeId ) => (
	dispatch,
	getState
) => {
	const allBoxes = getAllPackageDefinitions( getState(), siteId );
	const box = allBoxes[ boxTypeId ];

	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE,
		siteId,
		orderId,
		packageId,
		boxTypeId,
		box,
	} );
};

export const savePackages = ( orderId, siteId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SAVE_PACKAGES,
		siteId,
		orderId,
	};
};

export const removeItem = ( orderId, siteId, packageId, itemIndex ) => ( dispatch, getState ) => {
	dispatch( moveItem( orderId, siteId, packageId, itemIndex, '' ) );

	const selected = getShippingLabel( getState(), orderId, siteId ).form.packages.selected;
	if ( selected[ packageId ] && 'individual' === selected[ packageId ].box_id ) {
		dispatch( removePackage( orderId, siteId, packageId ) );
		dispatch( openPackage( orderId, siteId, '' ) );
	}
};

export const confirmPackages = ( orderId, siteId ) => ( dispatch, getState ) => {
	dispatch( toggleStep( orderId, siteId, 'packages' ) );
	dispatch( savePackages( orderId, siteId ) );
	tryGetLabelRates( orderId, siteId, dispatch, getState );
};

export const setContentsType = ( orderId, siteId, packageId, contentsType ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CONTENTS_TYPE,
	siteId,
	orderId,
	packageId,
	contentsType,
} );

export const setContentsExplanation = ( orderId, siteId, packageId, contentsExplanation ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CONTENTS_EXPLANATION,
	siteId,
	orderId,
	packageId,
	contentsExplanation,
} );

export const setRestrictionType = ( orderId, siteId, packageId, restrictionType ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RESTRICTION_TYPE,
	siteId,
	orderId,
	packageId,
	restrictionType,
} );

export const setRestrictionExplanation = ( orderId, siteId, packageId, restrictionComments ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RESTRICTION_COMMENTS,
	siteId,
	orderId,
	packageId,
	restrictionComments,
} );

export const setAbandonOnNonDelivery = ( orderId, siteId, packageId, abandonOnNonDelivery ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ABANDON_ON_NON_DELIVERY,
	siteId,
	orderId,
	packageId,
	abandonOnNonDelivery,
} );

export const setITN = ( orderId, siteId, packageId, itn ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ITN,
	siteId,
	orderId,
	packageId,
	itn,
} );

export const setCustomsItemDescription = ( orderId, siteId, productId, description ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_DESCRIPTION,
	siteId,
	orderId,
	productId,
	description,
} );

export const setCustomsItemTariffNumber = ( orderId, siteId, productId, tariffNumber ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_TARIFF_NUMBER,
	siteId,
	orderId,
	productId,
	tariffNumber,
} );

export const setCustomsItemWeight = ( orderId, siteId, productId, weight ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_WEIGHT,
	siteId,
	orderId,
	productId,
	weight,
} );

export const setCustomsItemValue = ( orderId, siteId, productId, value ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_VALUE,
	siteId,
	orderId,
	productId,
	value,
} );

export const setCustomsItemOriginCountry = ( orderId, siteId, productId, originCountry ) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_CUSTOMS_ITEM_ORIGIN_COUNTRY,
	siteId,
	orderId,
	productId,
	originCountry,
} );

const saveCustoms = ( orderId, siteId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SAVE_CUSTOMS,
		siteId,
		orderId,
	};
};

export const confirmCustoms = ( orderId, siteId ) => ( dispatch, getState ) => {
	dispatch( toggleStep( orderId, siteId, 'customs' ) );
	dispatch( saveCustoms( orderId, siteId ) );
	tryGetLabelRates( orderId, siteId, dispatch, getState );
};

export const updateRate = ( orderId, siteId, packageId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_RATE,
		siteId,
		orderId,
		packageId,
		value,
	};
};

export const setEmailDetailsOption = ( orderId, siteId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_EMAIL_DETAILS,
		siteId,
		orderId,
		value,
	};
};

export const setFulfillOrderOption = ( orderId, siteId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_FULFILL_ORDER,
		siteId,
		orderId,
		value,
	};
};

const purchaseLabelResponse = ( orderId, siteId, response, error ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_RESPONSE,
		orderId,
		siteId,
		response,
		error,
	};
};

const handleLabelPurchaseError = ( orderId, siteId, dispatch, getState, error ) => {
	dispatch( purchaseLabelResponse( orderId, siteId, null, true ) );
	dispatch( NoticeActions.errorNotice( error.toString() ) );
	//re-request the rates on failure to avoid attempting repurchase of the same shipment id
	dispatch( clearAvailableRates( orderId, siteId ) );
	tryGetLabelRates( orderId, siteId, dispatch, getState, noop );
};

const getPDFFileName = ( orderId, isReprint = false ) => {
	return `order-#${ orderId }-label` + ( isReprint ? '-reprint' : '' ) + '.pdf';
};

// retireves the single label status, and retries up to 3 times on timeout
const labelStatusTask = ( orderId, siteId, labelId, retryCount ) => {
	return api
		.get( siteId, api.url.labelStatus( orderId, labelId ) )
		.then( ( statusResponse ) => statusResponse.label )
		.catch( ( pollError ) => {
			if ( ! includes( pollError, 'cURL error 28' ) || retryCount >= 3 ) {
				throw pollError;
			}
			return new Promise( ( resolve ) => {
				setTimeout(
					() => resolve( labelStatusTask( orderId, siteId, labelId, retryCount + 1 ) ),
					1000
				);
			} );
		} );
};

const handlePrintFinished = ( orderId, siteId, dispatch, getState, hasError, labels ) => {
	dispatch( exitPrintingFlow( orderId, siteId, true ) );
	dispatch( clearAvailableRates( orderId, siteId ) );

	if ( hasError ) {
		return;
	}

	if ( shouldEmailDetails( getState(), orderId, siteId ) ) {
		const trackingNumbers = labels.map( ( label ) => label.tracking );
		const carrierId = first( labels ).carrier_id;
		let note = '';
		if ( 'usps' === carrierId ) {
			note = translate(
				'Your order has been shipped with USPS. The tracking number is %(trackingNumbers)s.',
				'Your order consisting of %(packageNum)d packages has been shipped with USPS. ' +
					'The tracking numbers are %(trackingNumbers)s.',
				{
					args: {
						packageNum: trackingNumbers.length,
						trackingNumbers: trackingNumbers.join( ', ' ),
					},
					count: trackingNumbers.length,
				}
			);
		} else {
			note = translate(
				'Your order has been shipped. The tracking number is %(trackingNumbers)s.',
				'Your order consisting of %(packageNum)d packages has been shipped. ' +
					'The tracking numbers are %(trackingNumbers)s.',
				{
					args: {
						packageNum: trackingNumbers.length,
						trackingNumbers: trackingNumbers.join( ', ' ),
					},
					count: trackingNumbers.length,
				}
			);
		}

		dispatch(
			createNote( siteId, orderId, {
				note,
				customer_note: true,
			} )
		);
	}

	if ( shouldFulfillOrder( getState(), orderId, siteId ) ) {
		dispatch(
			saveOrder( siteId, {
				id: orderId,
				status: 'completed',
			} )
		);
	}
};

/**
 * Generates the action that is triggered upon successful print.
 *
 * @param {number} count The amount of labels that were successfuly purchased and printed.
 * @returns {object}     TheA plain action object.
 */
const createPrintSuccessNotice = ( count ) => {
	return NoticeActions.successNotice(
		translate(
			'Your shipping label was purchased successfully',
			'Your %(count)d shipping labels were purchased successfully',
			{
				count,
				args: { count },
			}
		)
	);
};

/**
 * Generates a action that will show an error notice upon failed label download.
 *
 * @param  {number}   count   The amount of labels that are being purchased.
 * @param  {Function} onClick A callback for the retry button.
 * @returns {object}          The plain action that should be dispatched.
 */
const createPrintFailureNotice = ( count, onClick ) => {
	const errorMessage = translate(
		'Your shipping label was purchased successfully, but could not be printed automatically. Click "Reprint" to try again.',
		'Your shipping labels were purchased successfully, but some of them could not be printed automatically. Click "Reprint" to try again.',
		{ count }
	);

	return NoticeActions.errorNotice( errorMessage, {
		id: PRINTING_FAILED_NOTICE_ID,
		button: translate( 'Reprint' ),
		onClick,
	} );
};

/**
 * Attempts to download and print all labels that were just generated.
 *
 * @param {number}   orderId  The ID of the order that is being edited.
 * @param {number}   siteId   The ID of the current site.
 * @param {Function} dispatch A Redux dispatcher.
 * @param {Function} getState A function that returns the current state.
 * @param {Array}    labels   An array of labels that should be downloaded and printed.
 */
function downloadAndPrint( orderId, siteId, dispatch, getState, labels ) {
	// Backup the arguments for follow-up retries
	const downloadArgs = arguments;

	// No need to print the "Package 1 (of 1)" message if there's only 1 label
	const labelsToPrint =
		1 === labels.length
			? [ { labelId: labels[ 0 ].label_id } ]
			: labels.map( ( label, index ) => ( {
					caption: translate( 'PACKAGE %(num)d (OF %(total)d)', {
						args: {
							num: index + 1,
							total: labels.length,
						},
					} ),
					labelId: label.label_id,
			  } ) );

	const { paperSize } = getShippingLabel( getState(), orderId, siteId );
	const printUrl = getPrintURL( paperSize, labelsToPrint );

	const showSuccessNotice = () => {
		dispatch( createPrintSuccessNotice( labelsToPrint.length ) );
	};

	const retry = () => {
		dispatch( NoticeActions.removeNotice( PRINTING_FAILED_NOTICE_ID ) );
		dispatch(
			NoticeActions.infoNotice( translate( 'Printing…' ), {
				id: PRINTING_IN_PROGRESS_NOTICE_ID,
			} )
		);
		downloadAndPrint( ...downloadArgs );
	};

	const showErrorNotice = () => {
		// Manualy close the modal and remove old notices
		dispatch( exitPrintingFlow( orderId, siteId, true ) );
		dispatch( clearAvailableRates( orderId, siteId ) );
		dispatch( NoticeActions.removeNotice( PRINTING_IN_PROGRESS_NOTICE_ID ) );
		dispatch( createPrintFailureNotice( labels.length, retry ) );
	};

	let hasError = false;

	api
		.get( siteId, printUrl )
		.then( ( fileData ) => {
			dispatch( NoticeActions.removeNotice( PRINTING_IN_PROGRESS_NOTICE_ID ) );

			if ( 'addon' === getPDFSupport() ) {
				showSuccessNotice();
				// If the browser has a PDF "addon", we need another user click to trigger opening it in a new tab
				dispatch( {
					type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SHOW_PRINT_CONFIRMATION,
					orderId,
					siteId,
					fileData,
					labels,
				} );
			} else {
				printDocument( fileData, getPDFFileName( orderId ) )
					.then( () => {
						showSuccessNotice();
					} )
					.catch( ( err ) => {
						dispatch( NoticeActions.errorNotice( err.toString() ) );
						hasError = true;
					} )
					.then( () => {
						handlePrintFinished( orderId, siteId, dispatch, getState, hasError, labels );
					} );
			}
		} )
		.catch( showErrorNotice );
}

const pollForLabelsPurchase = ( orderId, siteId, dispatch, getState, labels ) => {
	const errorLabel = find( labels, { status: 'PURCHASE_ERROR' } );
	if ( errorLabel ) {
		handleLabelPurchaseError( orderId, siteId, dispatch, getState, errorLabel.error, orderId );
		return;
	}

	if ( ! every( labels, { status: 'PURCHASED' } ) ) {
		setTimeout( () => {
			const statusTasks = labels.map( ( label ) => {
				return label.status === 'PURCHASED'
					? label
					: labelStatusTask( orderId, siteId, label.label_id, 0 );
			} );

			Promise.all( statusTasks )
				.then( ( pollResponse ) =>
					pollForLabelsPurchase( orderId, siteId, dispatch, getState, pollResponse )
				)
				.catch( ( pollError ) =>
					handleLabelPurchaseError( orderId, siteId, dispatch, getState, pollError )
				);
		}, 1000 );
		return;
	}

	dispatch( purchaseLabelResponse( orderId, siteId, labels, false ) );

	downloadAndPrint( orderId, siteId, dispatch, getState, labels );
};

export const purchaseLabel = ( orderId, siteId ) => ( dispatch, getState ) => {
	let error = null;
	let labels = null;

	const setError = ( err ) => ( error = err );
	const setSuccess = ( json ) => {
		labels = json.labels;
	};
	const setIsSaving = ( saving ) => {
		if ( saving ) {
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_REQUEST, orderId, siteId } );
		} else if ( error ) {
			handleLabelPurchaseError( orderId, siteId, dispatch, getState, error );
		} else {
			pollForLabelsPurchase( orderId, siteId, dispatch, getState, labels );
		}
	};

	let form = getShippingLabel( getState(), orderId, siteId ).form;
	const addressNormalizationQueue = [];
	if ( ! form.origin.isNormalized ) {
		const task = normalizeAddress( orderId, siteId, dispatch, form.origin.values, 'origin' );
		addressNormalizationQueue.push( task );
	}
	if ( ! form.destination.isNormalized ) {
		const task = normalizeAddress(
			orderId,
			siteId,
			dispatch,
			form.destination.values,
			'destination'
		);
		addressNormalizationQueue.push( task );
	}

	Promise.all( addressNormalizationQueue )
		.then( ( normalizationResults ) => {
			if ( ! every( normalizationResults ) ) {
				return;
			}
			form = getShippingLabel( getState(), orderId, siteId ).form;
			const customsItems = isCustomsFormRequired( getState(), orderId, siteId )
				? form.customs.items
				: null;
			const formData = {
				async: true,
				origin: getAddressValues( form.origin ),
				destination: getAddressValues( form.destination ),
				packages: map( form.packages.selected, ( pckg, pckgId ) => {
					const packageFields = convertToApiPackage( pckg, customsItems );
					const rate = find( form.rates.available[ pckgId ].rates, {
						service_id: form.rates.values[ pckgId ],
					} );
					return {
						...packageFields,
						shipment_id: form.rates.available[ pckgId ].shipment_id,
						rate_id: rate.rate_id,
						service_id: form.rates.values[ pckgId ],
						carrier_id: rate.carrier_id,
						service_name: rate.title,
						products: flatten(
							pckg.items.map( ( item ) => fill( new Array( item.quantity ), item.product_id ) )
						),
					};
				} ),
			};

			//compatibility - only add the email_receipt if the plugin and the server support it
			const emailReceipt = getEmailReceipts( getState(), siteId );
			if ( isBoolean( emailReceipt ) ) {
				formData.email_receipt = emailReceipt;
			}

			setIsSaving( true );
			api
				.post( siteId, api.url.orderLabels( orderId ), formData )
				.then( setSuccess )
				.catch( setError )
				.then( () => setIsSaving( false ) );
		} )
		.catch( ( err ) => {
			console.error( err );
			dispatch( NoticeActions.errorNotice( err.toString() ) );
		} );
};

export const confirmPrintLabel = ( orderId, siteId ) => ( dispatch, getState ) => {
	const shippingLabel = getShippingLabel( getState(), orderId, siteId );
	printDocument( shippingLabel.form.fileData, getPDFFileName( orderId ) )
		.then( () => {
			dispatch( exitPrintingFlow( orderId, siteId, true ) );
			dispatch( clearAvailableRates( orderId, siteId ) );
			handlePrintFinished(
				orderId,
				siteId,
				dispatch,
				getState,
				false,
				shippingLabel.form.labelsToPrint
			);
		} )
		.catch( ( error ) => dispatch( NoticeActions.errorNotice( error.toString() ) ) );
};

export const openRefundDialog = ( orderId, siteId, labelId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REFUND_DIALOG,
		labelId,
		siteId,
		orderId,
	};
};

export const fetchLabelsStatus = ( orderId, siteId ) => ( dispatch, getState ) => {
	const shippingLabel = getShippingLabel( getState(), orderId, siteId );

	const labelRequests = shippingLabel.labels.map( ( label ) => {
		if ( label.statusUpdated ) {
			return;
		}
		const labelId = label.label_id;
		let error = null;
		let response = null;
		const setError = ( err ) => ( error = err );
		const setSuccess = ( json ) => {
			response = json.label;
		};

		return api
			.get( siteId, api.url.labelStatus( orderId, labelId ) )
			.then( setSuccess )
			.catch( setError )
			.then( () => {
				dispatch( {
					type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_STATUS_RESPONSE,
					orderId,
					siteId,
					labelId,
					response,
					error,
				} );
				if ( error ) {
					throw error;
				}
			} );
	} );

	// Handle error with a single notice
	Promise.all( labelRequests ).catch( ( error ) => {
		dispatch(
			NoticeActions.errorNotice( `Failed to retrieve shipping label refund status: ${ error }` )
		);
	} );
};

export const closeRefundDialog = ( orderId, siteId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REFUND_DIALOG, orderId, siteId };
};

export const confirmRefund = ( orderId, siteId ) => ( dispatch, getState ) => {
	const labelId = getShippingLabel( getState(), orderId, siteId ).refundDialog.labelId;
	let error = null;
	let response = null;
	const setError = ( err ) => {
		error = err;
	};
	const setSuccess = ( json ) => {
		response = json.refund;
	};
	const setIsSaving = ( saving ) => {
		if ( saving ) {
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_REQUEST, orderId, siteId } );
		} else {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_RESPONSE,
				response,
				error,
				orderId,
				siteId,
			} );
			if ( error ) {
				dispatch( NoticeActions.errorNotice( error.toString() ) );
			} else {
				dispatch(
					NoticeActions.successNotice(
						translate( 'The refund request has been sent successfully.' ),
						{ duration: 5000 }
					)
				);
			}
		}
	};

	setIsSaving( true );
	api
		.post( siteId, api.url.labelRefund( orderId, labelId ) )
		.then( setSuccess )
		.catch( setError )
		.then( () => setIsSaving( false ) );
};

export const openReprintDialog = ( orderId, siteId, labelId ) => ( dispatch, getState ) => {
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REPRINT_DIALOG,
		labelId,
		orderId,
		siteId,
	} );

	dispatch( NoticeActions.removeNotice( 'wcs-reprint-label' ) );
	const shippingLabel = getShippingLabel( getState(), orderId, siteId );
	const printUrl = getPrintURL( shippingLabel.paperSize, [ { labelId } ] );

	api
		.get( siteId, printUrl )
		.then( ( fileData ) => {
			const shippingLabelAfter = getShippingLabel( getState(), orderId, siteId );
			if ( shippingLabel.paperSize === shippingLabelAfter.paperSize ) {
				dispatch( {
					type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REPRINT_DIALOG_READY,
					labelId,
					orderId,
					siteId,
					fileData,
				} );
			}
		} )
		.catch( ( error ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REPRINT_DIALOG_ERROR,
				labelId,
				orderId,
				siteId,
			} );
			dispatch(
				NoticeActions.errorNotice( error.toString(), {
					id: 'wcs-reprint-label',
					button: translate( 'Retry' ),
					onClick: () => dispatch( openReprintDialog( orderId, siteId, labelId ) ),
				} )
			);
		} );
};

export const closeReprintDialog = ( orderId, siteId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REPRINT_DIALOG, orderId, siteId };
};

export const confirmReprint = ( orderId, siteId ) => ( dispatch, getState ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_REPRINT, orderId, siteId } );
	const shippingLabel = getShippingLabel( getState(), orderId, siteId );

	printDocument( shippingLabel.reprintDialog.fileData, getPDFFileName( orderId, true ) )
		.catch( ( error ) => {
			console.error( error );
			dispatch( NoticeActions.errorNotice( error.toString() ) );
		} )
		.then( () => dispatch( closeReprintDialog( orderId, siteId ) ) );
};

export const updatePaperSize = ( orderId, siteId, value ) => ( dispatch, getState ) => {
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PAPER_SIZE,
		siteId,
		orderId,
		value,
	} );

	const shippingLabel = getShippingLabel( getState(), orderId, siteId );
	if ( shippingLabel.reprintDialog != null ) {
		dispatch( openReprintDialog( orderId, siteId, shippingLabel.reprintDialog.labelId ) );
	}
};

export const openDetailsDialog = ( orderId, siteId, labelId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_DETAILS_DIALOG,
		labelId,
		siteId,
		orderId,
	};
};

export const closeDetailsDialog = ( orderId, siteId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_DETAILS_DIALOG, orderId, siteId };
};
