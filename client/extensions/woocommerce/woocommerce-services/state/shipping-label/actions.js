/** @format */

/* eslint-disable no-console */
/* eslint-disable wpcalypso/i18n-mismatched-placeholders */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { every, fill, find, flatten, includes, isBoolean, isEqual, map, noop, pick } from 'lodash';

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
} from './selectors';
import { saveOrder } from 'woocommerce/state/sites/orders/actions';
import { getAllPackageDefinitions } from 'woocommerce/woocommerce-services/state/packages/selectors';
import { getEmailReceipts } from 'woocommerce/woocommerce-services/state/label-settings/selectors';

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
} from '../action-types.js';

export const fetchLabelsData = ( orderId, siteId ) => dispatch => {
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_IS_FETCHING,
		orderId,
		siteId,
		isFetching: true,
	} );

	api
		.get( siteId, api.url.orderLabels( orderId ) )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_INIT,
				siteId,
				orderId,
				...data,
			} );
		} )
		.catch( error => {
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

const waitForAllPromises = promises => {
	// Thin wrapper over Promise.all, that makes the Promise chain wait for all the promises
	// to be completed, even if one of them is rejected.
	return Promise.all( promises.map( p => p.catch( e => e ) ) );
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

const convertToApiPackage = pckg => {
	return pick( pckg, [
		'id',
		'box_id',
		'service_id',
		'length',
		'width',
		'height',
		'weight',
		'signature',
	] );
};

export const clearAvailableRates = ( orderId, siteId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLEAR_AVAILABLE_RATES, orderId, siteId };
};

/**
 * Checks the form for errors, and if there are none, fetches the label rates. Otherwise expands the first erroneous step
 * @param {Number} orderId order ID
 * @param {Number} siteId site ID
 * @param {Function} dispatch dispatch function
 * @param {Function} getState getState functuon
 *
 * @returns {Promise} getRates promise
 */
const tryGetLabelRates = ( orderId, siteId, dispatch, getState ) => {
	const state = getState();
	const erroneousStep = getFirstErroneousStep( state, orderId, siteId );
	if ( erroneousStep && 'rates' !== erroneousStep ) {
		expandFirstErroneousStep( orderId, siteId, dispatch, getState );
		return;
	}

	const formState = getShippingLabel( state, orderId, siteId ).form;
	const { origin, destination, packages } = formState;

	dispatch( NoticeActions.removeNotice( 'wcs-label-rates' ) );

	return getRates(
		orderId,
		siteId,
		dispatch,
		origin.values,
		destination.values,
		map( packages.selected, convertToApiPackage )
	)
		.then( () => expandFirstErroneousStep( orderId, siteId, dispatch, getState ) )
		.catch( error => {
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
	const handleNormalizeResponse = success => {
		if ( ! success ) {
			return;
		}
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
	if ( state.isNormalized && isEqual( state.values, state.normalized ) ) {
		handleNormalizeResponse( true );
		return;
	}
	normalizeAddress(
		orderId,
		siteId,
		dispatch,
		getShippingLabel( getState(), orderId, siteId ).form[ group ].values,
		group
	)
		.then( handleNormalizeResponse )
		.catch( error => {
			console.error( error );
			dispatch( NoticeActions.errorNotice( error.toString() ) );
		} );
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
		.then( statusResponse => statusResponse.label )
		.catch( pollError => {
			if ( ! includes( pollError, 'cURL error 28' ) || retryCount >= 3 ) {
				throw pollError;
			}
			return new Promise( resolve => {
				setTimeout(
					() => resolve( labelStatusTask( orderId, siteId, labelId, retryCount + 1 ) ),
					1000
				);
			} );
		} );
};

const handlePrintFinished = ( orderId, siteId, dispatch, getState, hasError ) => {
	dispatch( exitPrintingFlow( orderId, siteId, true ) );
	dispatch( clearAvailableRates( orderId, siteId ) );

	if ( hasError ) {
		return;
	}

	if ( shouldFulfillOrder( getState(), orderId, siteId ) ) {
		dispatch(
			saveOrder( siteId, {
				id: orderId,
				status: 'completed',
				email_tracking_info: shouldEmailDetails( getState(), orderId, siteId ),
			} )
		);
	}
};

const pollForLabelsPurchase = ( orderId, siteId, dispatch, getState, labels ) => {
	const errorLabel = find( labels, { status: 'PURCHASE_ERROR' } );
	if ( errorLabel ) {
		handleLabelPurchaseError( orderId, siteId, dispatch, getState, errorLabel.error, orderId );
		return;
	}

	if ( ! every( labels, { status: 'PURCHASED' } ) ) {
		setTimeout( () => {
			const statusTasks = labels.map( label => {
				return label.status === 'PURCHASED'
					? label
					: labelStatusTask( orderId, siteId, label.label_id, 0 );
			} );

			Promise.all( statusTasks )
				.then( pollResponse =>
					pollForLabelsPurchase( orderId, siteId, dispatch, getState, pollResponse )
				)
				.catch( pollError =>
					handleLabelPurchaseError( orderId, siteId, dispatch, getState, pollError )
				);
		}, 1000 );
		return;
	}

	dispatch( purchaseLabelResponse( orderId, siteId, labels, false ) );

	const labelsToPrint = labels.map( ( label, index ) => ( {
		caption: translate( 'PACKAGE %(num)d (OF %(total)d)', {
			args: {
				num: index + 1,
				total: labels.length,
			},
		} ),
		labelId: label.label_id,
	} ) );
	const state = getShippingLabel( getState(), orderId, siteId );
	const printUrl = getPrintURL( state.paperSize, labelsToPrint );
	const showSuccessNotice = () => {
		dispatch(
			NoticeActions.successNotice(
				translate(
					'Your shipping label was purchased successfully',
					'Your %(count)d shipping labels were purchased successfully',
					{
						count: labels.length,
						args: { count: labels.length },
					}
				)
			)
		);
	};
	let hasError = false;

	api.get( siteId, printUrl ).then( fileData => {
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
				.catch( err => {
					console.error( err );
					dispatch( NoticeActions.errorNotice( err.toString() ) );
					hasError = true;
				} )
				.then( () => {
					handlePrintFinished( orderId, siteId, dispatch, getState, hasError, labels );
				} );
		}
	} );
};

export const purchaseLabel = ( orderId, siteId ) => ( dispatch, getState ) => {
	let error = null;
	let labels = null;

	const setError = err => ( error = err );
	const setSuccess = json => {
		labels = json.labels;
	};
	const setIsSaving = saving => {
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
		.then( normalizationResults => {
			if ( ! every( normalizationResults ) ) {
				return;
			}
			const state = getShippingLabel( getState(), orderId, siteId );
			form = state.form;
			const formData = {
				async: true,
				origin: form.origin.selectNormalized ? form.origin.normalized : form.origin.values,
				destination: form.destination.selectNormalized
					? form.destination.normalized
					: form.destination.values,
				packages: map( form.packages.selected, ( pckg, pckgId ) => {
					const rate = find( form.rates.available[ pckgId ].rates, {
						service_id: form.rates.values[ pckgId ],
					} );
					return {
						...convertToApiPackage( pckg ),
						shipment_id: form.rates.available[ pckgId ].shipment_id,
						rate_id: rate.rate_id,
						service_id: form.rates.values[ pckgId ],
						carrier_id: rate.carrier_id,
						service_name: rate.title,
						products: flatten(
							pckg.items.map( item => fill( new Array( item.quantity ), item.product_id ) )
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
		.catch( err => {
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
		.catch( error => dispatch( NoticeActions.errorNotice( error.toString() ) ) );
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

	const labelRequests = shippingLabel.labels.map( label => {
		if ( label.statusUpdated ) {
			return;
		}
		const labelId = label.label_id;
		let error = null;
		let response = null;
		const setError = err => ( error = err );
		const setSuccess = json => {
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
	Promise.all( labelRequests ).catch( error => {
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
	const setError = err => {
		error = err;
	};
	const setSuccess = json => {
		response = json.refund;
	};
	const setIsSaving = saving => {
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
		.then( fileData => {
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
		.catch( error => {
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
		.catch( error => {
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
