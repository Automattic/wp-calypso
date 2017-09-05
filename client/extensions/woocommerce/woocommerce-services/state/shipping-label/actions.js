/* eslint-disable no-console */
/**
 * External dependencies
 */
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

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
import { getShippingLabel, getFormErrors } from './selectors';

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
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REPRINT_DIALOG,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_REPRINT,
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
} from '../action-types.js';

const FORM_STEPS = [ 'origin', 'destination', 'packages', 'rates' ];

export const fetchLabelsData = ( siteId, orderId ) => ( dispatch ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_IS_FETCHING, siteId, orderId, isFetching: true } );

	api.get( siteId, api.url.orderLabels( orderId ) )
		.then( ( { formData, labelsData, paperSize, storeOptions, paymentMethod, numPaymentMethods } ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_INIT,
				siteId,
				orderId,
				formData,
				labelsData,
				paperSize,
				storeOptions,
				paymentMethod,
				numPaymentMethods,
			} );
		} )
		.catch( ( error ) => {
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_FETCH_ERROR, siteId, orderId, error: true } );
			console.error( error ); // eslint-disable-line no-console
		} )
		.then( () => dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_IS_FETCHING, siteId, orderId, isFetching: false } ) );
};

export const toggleStep = ( stepName ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
		stepName,
	};
};

const waitForAllPromises = ( promises ) => {
	// Thin wrapper over Promise.all, that makes the Promise chain wait for all the promises
	// to be completed, even if one of them is rejected.
	return Promise.all( promises.map( ( p ) => p.catch( ( e ) => e ) ) );
};

const getNextErroneousStep = ( state, errors, currentStep ) => {
	const firstStepToCheck = FORM_STEPS[ FORM_STEPS.indexOf( currentStep ) + 1 ];
	const form = state.shippingLabel.form;
	switch ( firstStepToCheck ) {
		case 'origin':
			if ( ! form.origin.isNormalized || ! _.isEqual( form.origin.values, form.origin.normalized ) ) {
				return 'origin';
			}
		case 'destination':
			if ( ! form.destination.isNormalized || ! _.isEqual( form.destination.values, form.destination.normalized ) ) {
				return 'destination';
			}
		case 'packages':
			if ( hasNonEmptyLeaves( errors.packages ) || ! form.packages.all || ! Object.keys( form.packages.all ).length ) {
				return 'packages';
			}
		case 'rates':
			if ( hasNonEmptyLeaves( errors.rates ) ) {
				return 'rates';
			}
	}
	return null;
};

const expandFirstErroneousStep = ( dispatch, getState, storeOptions, currentStep = null ) => {
	const step = getNextErroneousStep( getState(), getFormErrors( getState(), storeOptions ), currentStep );
	if ( step && ! getState().shippingLabel.form[ step ].expanded ) {
		dispatch( toggleStep( step ) );
	}
};

export const submitStep = ( stepName ) => ( dispatch, getState ) => {
	const state = getState().shippingLabel;
	const storeOptions = state.storeOptions;

	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
		stepName,
	} );
	expandFirstErroneousStep( dispatch, getState, storeOptions, stepName );
};

const convertToApiPackage = ( pckg ) => {
	return _.pick( pckg, [ 'id', 'box_id', 'service_id', 'length', 'width', 'height', 'weight' ] );
};

export const clearAvailableRates = () => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLEAR_AVAILABLE_RATES };
};

const getLabelRates = ( dispatch, getState, handleResponse, { orderId } ) => {
	const formState = getState().shippingLabel.form;
	const {
		origin,
		destination,
		packages,
	} = formState;

	return getRates( dispatch, origin.values, destination.values, _.map( packages.selected, convertToApiPackage ), orderId )
		.then( handleResponse )
		.catch( ( error ) => {
			console.error( error );
			dispatch( NoticeActions.errorNotice( error.toString() ) );
		} );
};

export const openPrintingFlow = () => (
	dispatch,
	getState,
	{ orderId },
	getErrors = getFormErrors
) => {
	const state = getState().shippingLabel;
	const storeOptions = state.storeOptions;
	let form = state.form;
	const { origin, destination } = form;
	const errors = getErrors( getState(), storeOptions );
	const promisesQueue = [];

	if ( ! origin.ignoreValidation &&
		! hasNonEmptyLeaves( errors.origin ) &&
		! origin.isNormalized &&
		! origin.normalizationInProgress ) {
		promisesQueue.push( normalizeAddress( dispatch, origin.values, 'origin' ) );
	}

	if ( origin.ignoreValidation || hasNonEmptyLeaves( errors.origin ) ) {
		dispatch( toggleStep( 'origin' ) );
	}

	if ( ! destination.ignoreValidation &&
		! hasNonEmptyLeaves( errors.destination ) &&
		! destination.isNormalized &&
		! destination.normalizationInProgress ) {
		promisesQueue.push( normalizeAddress( dispatch, destination.values, 'destination' ) );
	}

	if ( destination.ignoreValidation || hasNonEmptyLeaves( errors.destination ) ) {
		dispatch( toggleStep( 'destination' ) );
	}

	waitForAllPromises( promisesQueue ).then( () => {
		form = getState().shippingLabel.form;

		const expandStepAfterAction = () => {
			expandFirstErroneousStep( dispatch, getState, storeOptions );
		};

		// If origin and destination are normalized, get rates
		if (
			form.origin.isNormalized &&
			_.isEqual( form.origin.values, form.origin.normalized ) &&
			form.destination.isNormalized &&
			_.isEqual( form.destination.values, form.destination.normalized ) &&
			_.isEmpty( form.rates.available ) &&
			form.packages.all && Object.keys( form.packages.all ).length &&
			! hasNonEmptyLeaves( errors.packages )
		) {
			return getLabelRates( dispatch, getState, expandStepAfterAction, { orderId } );
		}

		// Otherwise, just expand the next errant step unless the
		// user already interacted with the form
		if ( _.some( FORM_STEPS.map( ( step ) => form[ step ].expanded ) ) ) {
			return;
		}

		expandStepAfterAction();
	} );

	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW } );
};

export const exitPrintingFlow = ( force ) => ( dispatch, getState ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EXIT_PRINTING_FLOW, force } );

	const form = getState().shippingLabel.form;

	if ( form.needsPrintConfirmation ) {
		dispatch( clearAvailableRates() );
	}
};

export const updateAddressValue = ( group, name, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_ADDRESS_VALUE,
		group,
		name,
		value,
	};
};

export const selectNormalizedAddress = ( group, selectNormalized ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SELECT_NORMALIZED_ADDRESS,
		group,
		selectNormalized,
	};
};

export const editAddress = ( group ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EDIT_ADDRESS,
		group,
	};
};

export const removeIgnoreValidation = ( group ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_IGNORE_VALIDATION,
		group,
	};
};

export const confirmAddressSuggestion = ( group ) => ( dispatch, getState, { orderId } ) => {
	const storeOptions = getState().shippingLabel.storeOptions;

	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_ADDRESS_SUGGESTION,
		group,
	} );

	const handleResponse = () => {
		expandFirstErroneousStep( dispatch, getState, storeOptions, group );
	};

	const state = getState();

	const errors = getFormErrors( state, storeOptions );

	// If all prerequisite steps are error free, fetch new rates
	if (
		hasNonEmptyLeaves( errors.origin ) ||
		hasNonEmptyLeaves( errors.destination ) ||
		hasNonEmptyLeaves( errors.packages )
	) {
		return;
	}

	getLabelRates( dispatch, getState, handleResponse, { orderId } );
};

export const submitAddressForNormalization = ( group ) => ( dispatch, getState, { orderId } ) => {
	const storeOptions = getState().shippingLabel.storeOptions;
	const handleNormalizeResponse = ( success ) => {
		if ( ! success ) {
			return;
		}
		const { values, normalized, expanded } = getState().shippingLabel.form[ group ];

		if ( _.isEqual( values, normalized ) ) {
			if ( expanded ) {
				dispatch( toggleStep( group ) );
			}

			const handleRatesResponse = () => {
				expandFirstErroneousStep( dispatch, getState, storeOptions, group );
			};

			const errors = getFormErrors( getState(), storeOptions );

			// If all prerequisite steps are error free, fetch new rates
			if (
				hasNonEmptyLeaves( errors.origin ) ||
				hasNonEmptyLeaves( errors.destination ) ||
				hasNonEmptyLeaves( errors.packages )
			) {
				return;
			}

			getLabelRates( dispatch, getState, handleRatesResponse, { orderId } );
		}
	};

	let state = getState().shippingLabel.form[ group ];
	if ( state.ignoreValidation ) {
		dispatch( removeIgnoreValidation( group ) );
		const errors = getFormErrors( getState(), storeOptions );
		if ( hasNonEmptyLeaves( errors[ group ] ) ) {
			return;
		}
		state = getState().shippingLabel.form[ group ];
	}
	if ( state.isNormalized && _.isEqual( state.values, state.normalized ) ) {
		handleNormalizeResponse( true );
		return;
	}
	normalizeAddress( dispatch, getState().shippingLabel.form[ group ].values, group )
		.then( handleNormalizeResponse )
		.catch( ( error ) => {
			console.error( error );
			dispatch( NoticeActions.errorNotice( error.toString() ) );
		} );
};

export const updatePackageWeight = ( packageId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PACKAGE_WEIGHT,
		packageId,
		value,
	};
};

export const openPackage = ( openedPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PACKAGE,
		openedPackageId,
	};
};

export const openItemMove = ( movedItemIndex ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ITEM_MOVE,
		movedItemIndex,
	};
};

export const moveItem = ( originPackageId, movedItemIndex, targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_MOVE_ITEM,
		originPackageId,
		movedItemIndex,
		targetPackageId,
	};
};

export const closeItemMove = () => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ITEM_MOVE,
	};
};

export const setTargetPackage = ( targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_TARGET_PACKAGE,
		targetPackageId,
	};
};

export const openAddItem = () => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ADD_ITEM,
	};
};

export const closeAddItem = () => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ADD_ITEM,
	};
};

export const setAddedItem = ( sourcePackageId, movedItemIndex, added ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ADDED_ITEM,
		sourcePackageId,
		movedItemIndex,
		added,
	};
};

export const addItems = ( targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_ITEMS,
		targetPackageId,
	};
};

export const addPackage = () => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_PACKAGE,
	};
};

export const removePackage = ( packageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_PACKAGE,
		packageId,
	};
};

export const setPackageType = ( packageId, boxTypeId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE,
		packageId,
		boxTypeId,
	};
};

export const savePackages = () => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SAVE_PACKAGES,
	};
};

export const removeItem = ( packageId, itemIndex ) => ( dispatch, getState ) => {
	dispatch( moveItem( packageId, itemIndex, '' ) );

	const selected = getState().shippingLabel.form.packages.selected;
	if ( selected[ packageId ] && 'individual' === selected[ packageId ].box_id ) {
		dispatch( removePackage( packageId ) );
		dispatch( openPackage( '' ) );
	}
};

export const confirmPackages = () => ( dispatch, getState, { orderId } ) => {
	const storeOptions = getState().shippingLabel.storeOptions;
	dispatch( toggleStep( 'packages' ) );
	dispatch( savePackages() );

	const handleResponse = () => {
		expandFirstErroneousStep( dispatch, getState, storeOptions, 'packages' );
	};

	getLabelRates( dispatch, getState, handleResponse, { orderId } );
};

export const updateRate = ( packageId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_RATE,
		packageId,
		value,
	};
};

export const updatePaperSize = ( value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PAPER_SIZE,
		value,
	};
};

const purchaseLabelResponse = ( response, error ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_RESPONSE, response, error };
};

const handleLabelPurchaseError = ( dispatch, getState, error, orderId ) => {
	dispatch( purchaseLabelResponse( null, true ) );
	if ( 'rest_cookie_invalid_nonce' === error ) {
		dispatch( exitPrintingFlow( true ) );
	} else {
		dispatch( NoticeActions.errorNotice( error ) );
		//re-request the rates on failure to avoid attempting repurchase of the same shipment id
		dispatch( clearAvailableRates() );
		getLabelRates( dispatch, getState, _.noop, { orderId } );
	}
};

const pollForLabelsPurchase = ( dispatch, getState, orderId, labels ) => {
	const errorLabel = _.find( labels, { status: 'PURCHASE_ERROR' } );
	if ( errorLabel ) {
		handleLabelPurchaseError( dispatch, getState, errorLabel.error, orderId );
		return;
	}

	if ( ! _.every( labels, { status: 'PURCHASED' } ) ) {
		setTimeout( () => {
			const statusTasks = labels.map( ( label ) => (
				api.get( api.url.labelStatus( orderId, label.label_id ) )
					.then( ( statusResponse ) => statusResponse.label )
			) );

			Promise.all( statusTasks )
				.then( ( pollResponse ) => pollForLabelsPurchase( dispatch, getState, orderId, pollResponse ) )
				.catch( ( pollError ) => handleLabelPurchaseError( dispatch, getState, pollError, orderId ) );
		}, 1000 );
		return;
	}

	dispatch( purchaseLabelResponse( labels, false ) );

	const labelsToPrint = labels.map( ( label, index ) => ( {
		caption: __( 'PACKAGE %(num)d (OF %(total)d)', {
			args: {
				num: index + 1,
				total: labels.length,
			},
		} ),
		labelId: label.label_id,
	} ) );
	const state = getState().shippingLabel;
	const printUrl = getPrintURL( state.paperSize, labelsToPrint );
	if ( 'addon' === getPDFSupport() ) {
		// If the browser has a PDF "addon", we need another user click to trigger opening it in a new tab
		dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SHOW_PRINT_CONFIRMATION, printUrl } );
	} else {
		printDocument( printUrl )
			.then( () => {
				dispatch( NoticeActions.successNotice( __(
					'Your shipping label was purchased successfully',
					'Your %(count)d shipping labels were purchased successfully',
					{
						count: labels.length,
						args: { count: labels.length },
					}
				) ) );
			} )
			.catch( ( err ) => {
				console.error( err );
				dispatch( NoticeActions.errorNotice( err.toString() ) );
			} )
			.then( () => {
				dispatch( exitPrintingFlow( true ) );
				dispatch( clearAvailableRates() );
			} );
	}
};

export const purchaseLabel = () => ( dispatch, getState, { orderId } ) => {
	let error = null;
	let labels = null;

	const setError = ( err ) => error = err;
	const setSuccess = ( json ) => {
		labels = json.labels;
	};
	const setIsSaving = ( saving ) => {
		if ( saving ) {
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_REQUEST } );
		} else if ( error ) {
			handleLabelPurchaseError( dispatch, getState, error, orderId );
		} else {
			pollForLabelsPurchase( dispatch, getState, orderId, labels );
		}
	};

	let form = getState().shippingLabel.form;
	const addressNormalizationQueue = [];
	if ( ! form.origin.isNormalized ) {
		const task = normalizeAddress( dispatch, form.origin.values, 'origin' );
		addressNormalizationQueue.push( task );
	}
	if ( ! form.destination.isNormalized ) {
		const task = normalizeAddress( dispatch, form.destination.values, 'destination' );
		addressNormalizationQueue.push( task );
	}

	Promise.all( addressNormalizationQueue ).then( ( normalizationResults ) => {
		if ( ! _.every( normalizationResults ) ) {
			return;
		}
		const state = getState().shippingLabel;
		form = state.form;
		const formData = {
			async: true,
			origin: form.origin.selectNormalized ? form.origin.normalized : form.origin.values,
			destination: form.destination.selectNormalized ? form.destination.normalized : form.destination.values,
			packages: _.map( form.packages.selected, ( pckg, pckgId ) => {
				const rate = _.find( form.rates.available[ pckgId ].rates, { service_id: form.rates.values[ pckgId ] } );
				return {
					...convertToApiPackage( pckg ),
					shipment_id: form.rates.available[ pckgId ].shipment_id,
					rate_id: rate.rate_id,
					service_id: form.rates.values[ pckgId ],
					carrier_id: rate.carrier_id,
					service_name: rate.title,
					products: _.flatten( pckg.items.map( ( item ) => _.fill( new Array( item.quantity ), item.product_id ) ) ),
				};
			} ),
		};

		setIsSaving( true );
		api.post( api.url.orderLabels( orderId ), formData )
			.then( setSuccess )
			.catch( setError )
			.then( () => setIsSaving( false ) );
	} ).catch( ( err ) => {
		console.error( err );
		dispatch( NoticeActions.errorNotice( err.toString() ) );
	} );
};

export const confirmPrintLabel = ( url ) => ( dispatch ) => {
	printDocument( url )
		.then( () => {
			dispatch( exitPrintingFlow( true ) );
			dispatch( clearAvailableRates() );
		} )
		.catch( ( error ) => dispatch( NoticeActions.errorNotice( error.toString() ) ) );
};

export const openRefundDialog = ( labelId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REFUND_DIALOG,
		labelId,
	};
};

export const fetchLabelsStatus = ( siteId, orderId ) => ( dispatch, getState ) => {
	const shippingLabel = getShippingLabel( getState(), orderId, siteId );

	shippingLabel.labels.forEach( ( label ) => {
		if ( label.statusUpdated ) {
			return;
		}
		const labelId = label.label_id;
		let error = null;
		let response = null;
		const setError = ( err ) => error = err;
		const setSuccess = ( json ) => {
			response = json.label;
		};
		const setIsSaving = ( saving ) => {
			if ( ! saving ) {
				dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_STATUS_RESPONSE, labelId, response, error } );
				if ( error ) {
					dispatch( NoticeActions.errorNotice( error.toString() ) );
				}
			}
		};

		setIsSaving( true );
		api.get( siteId, api.url.labelStatus( orderId, labelId ) )
			.then( setSuccess )
			.catch( setError )
			.then( () => setIsSaving( false ) );
	} );
};

export const closeRefundDialog = () => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REFUND_DIALOG };
};

export const confirmRefund = () => ( dispatch, getState, { orderId } ) => {
	const labelId = getState().shippingLabel.refundDialog.labelId;
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
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_REQUEST } );
		} else {
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_RESPONSE, response, error } );
			if ( error ) {
				dispatch( NoticeActions.errorNotice( error.toString() ) );
			} else {
				dispatch( NoticeActions.successNotice( __( 'The refund request has been sent successfully.' ), { duration: 5000 } ) );
			}
		}
	};

	setIsSaving( true );
	api.post( api.url.labelRefund( orderId, labelId ) )
		.then( setSuccess )
		.catch( setError )
		.then( () => setIsSaving( false ) );
};

export const openReprintDialog = ( labelId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REPRINT_DIALOG, labelId };
};

export const closeReprintDialog = () => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REPRINT_DIALOG };
};

export const confirmReprint = () => ( dispatch, getState ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_REPRINT } );
	const state = getState().shippingLabel;
	const labelId = state.reprintDialog.labelId;
	printDocument( getPrintURL( getState().shippingLabel.paperSize, [ { labelId } ] ) )
		.catch( ( error ) => {
			console.error( error );
			dispatch( NoticeActions.errorNotice( error.toString() ) );
		} )
		.then( () => dispatch( closeReprintDialog() ) );
};
