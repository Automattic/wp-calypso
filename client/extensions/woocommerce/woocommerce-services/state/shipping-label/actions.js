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

export const toggleStep = ( siteId, orderId, stepName ) => {
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

const getNextErroneousStep = ( form, errors, currentStep ) => {
	const firstStepToCheck = FORM_STEPS[ FORM_STEPS.indexOf( currentStep ) + 1 ];
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

const expandFirstErroneousStep = ( siteId, orderId, dispatch, getState, storeOptions, currentStep = null ) => {
	const shippingLabel = getShippingLabel( getState(), orderId, siteId );
	const form = shippingLabel.form;

	const step = getNextErroneousStep( form, getFormErrors( getState(), orderId, siteId ), currentStep );
	if ( step && ! form[ step ].expanded ) {
		dispatch( toggleStep( siteId, orderId, step ) );
	}
};

export const submitStep = ( siteId, orderId, stepName ) => ( dispatch, getState ) => {
	const state = getShippingLabel( getState(), orderId, siteId );
	const storeOptions = state.storeOptions;

	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_TOGGLE_STEP,
		stepName,
		siteId,
		orderId,
	} );
	expandFirstErroneousStep( siteId, orderId, dispatch, getState, storeOptions, stepName );
};

const convertToApiPackage = ( pckg ) => {
	return _.pick( pckg, [ 'id', 'box_id', 'service_id', 'length', 'width', 'height', 'weight' ] );
};

export const clearAvailableRates = ( siteId, orderId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLEAR_AVAILABLE_RATES, siteId, orderId };
};

const getLabelRates = ( siteId, orderId, dispatch, getState, handleResponse ) => {
	const formState = getShippingLabel( getState(), orderId, siteId ).form;
	const {
		origin,
		destination,
		packages,
	} = formState;

	return getRates( siteId, orderId, dispatch, origin.values, destination.values, _.map( packages.selected, convertToApiPackage ) )
		.then( handleResponse )
		.catch( ( error ) => {
			console.error( error );
			dispatch( NoticeActions.errorNotice( error.toString() ) );
		} );
};

export const openPrintingFlow = ( siteId, orderId ) => (
	dispatch,
	getState,
	getErrors = getFormErrors
) => {
	const state = getShippingLabel( getState(), orderId, siteId );
	const storeOptions = state.storeOptions;
	let form = state.form;
	const { origin, destination } = form;
	const errors = getErrors( getState(), orderId, siteId );
	const promisesQueue = [];

	if ( ! origin.ignoreValidation &&
		! hasNonEmptyLeaves( errors.origin ) &&
		! origin.isNormalized &&
		! origin.normalizationInProgress ) {
		promisesQueue.push( normalizeAddress( siteId, orderId, dispatch, origin.values, 'origin' ) );
	}

	if ( origin.ignoreValidation || hasNonEmptyLeaves( errors.origin ) ) {
		dispatch( toggleStep( siteId, orderId, 'origin' ) );
	}

	if ( ! destination.ignoreValidation &&
		! hasNonEmptyLeaves( errors.destination ) &&
		! destination.isNormalized &&
		! destination.normalizationInProgress ) {
		promisesQueue.push( normalizeAddress( siteId, orderId, dispatch, destination.values, 'destination' ) );
	}

	if ( destination.ignoreValidation || hasNonEmptyLeaves( errors.destination ) ) {
		dispatch( toggleStep( siteId, orderId, 'destination' ) );
	}

	waitForAllPromises( promisesQueue ).then( () => {
		form = getShippingLabel( getState(), orderId, siteId ).form;

		const expandStepAfterAction = () => {
			expandFirstErroneousStep( siteId, orderId, dispatch, getState, storeOptions );
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
			return getLabelRates( siteId, orderId, dispatch, getState, expandStepAfterAction, { orderId } );
		}

		// Otherwise, just expand the next errant step unless the
		// user already interacted with the form
		if ( _.some( FORM_STEPS.map( ( step ) => form[ step ].expanded ) ) ) {
			return;
		}

		expandStepAfterAction();
	} );

	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PRINTING_FLOW, siteId, orderId } );
};

export const exitPrintingFlow = ( siteId, orderId, force ) => ( dispatch, getState ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EXIT_PRINTING_FLOW, siteId, orderId, force } );

	const form = getShippingLabel( getState(), orderId, siteId ).form;

	if ( form.needsPrintConfirmation ) {
		dispatch( clearAvailableRates( siteId, orderId ) );
	}
};

export const updateAddressValue = ( siteId, orderId, group, name, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_ADDRESS_VALUE,
		siteId,
		orderId,
		group,
		name,
		value,
	};
};

export const selectNormalizedAddress = ( siteId, orderId, group, selectNormalized ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SELECT_NORMALIZED_ADDRESS,
		siteId,
		orderId,
		group,
		selectNormalized,
	};
};

export const editAddress = ( siteId, orderId, group ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_EDIT_ADDRESS,
		siteId,
		orderId,
		group,
	};
};

export const removeIgnoreValidation = ( siteId, orderId, group ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_IGNORE_VALIDATION,
		siteId,
		orderId,
		group,
	};
};

export const confirmAddressSuggestion = ( siteId, orderId, group ) => ( dispatch, getState, ) => {
	const storeOptions = getShippingLabel( getState(), orderId, siteId ).storeOptions;

	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_ADDRESS_SUGGESTION,
		siteId,
		orderId,
		group,
	} );

	const handleResponse = () => {
		expandFirstErroneousStep( siteId, orderId, dispatch, getState, storeOptions, group );
	};

	const state = getState();

	const errors = getFormErrors( state, orderId, siteId );

	// If all prerequisite steps are error free, fetch new rates
	if (
		hasNonEmptyLeaves( errors.origin ) ||
		hasNonEmptyLeaves( errors.destination ) ||
		hasNonEmptyLeaves( errors.packages )
	) {
		return;
	}

	getLabelRates( siteId, orderId, dispatch, getState, handleResponse, { orderId } );
};

export const submitAddressForNormalization = ( siteId, orderId, group ) => ( dispatch, getState ) => {
	const shippingLabel = getShippingLabel( getState(), orderId, siteId );
	const storeOptions = shippingLabel.storeOptions;
	const handleNormalizeResponse = ( success ) => {
		if ( ! success ) {
			return;
		}
		const { values, normalized, expanded } = shippingLabel.form[ group ];

		if ( _.isEqual( values, normalized ) ) {
			if ( expanded ) {
				dispatch( toggleStep( siteId, orderId, group ) );
			}

			const handleRatesResponse = () => {
				expandFirstErroneousStep( siteId, orderId, dispatch, getState, storeOptions, group );
			};

			const errors = getFormErrors( getState(), orderId, siteId );

			// If all prerequisite steps are error free, fetch new rates
			if (
				hasNonEmptyLeaves( errors.origin ) ||
				hasNonEmptyLeaves( errors.destination ) ||
				hasNonEmptyLeaves( errors.packages )
			) {
				return;
			}

			getLabelRates( siteId, orderId, dispatch, getState, handleRatesResponse, { orderId } );
		}
	};

	let state = getShippingLabel( getState(), orderId, siteId ).form[ group ];
	if ( state.ignoreValidation ) {
		dispatch( removeIgnoreValidation( siteId, orderId, group ) );
		const errors = getFormErrors( getState(), orderId, siteId );
		if ( hasNonEmptyLeaves( errors[ group ] ) ) {
			return;
		}
		state = getShippingLabel( getState(), orderId, siteId ).form[ group ];
	}
	if ( state.isNormalized && _.isEqual( state.values, state.normalized ) ) {
		handleNormalizeResponse( true );
		return;
	}
	normalizeAddress( siteId, orderId, dispatch, getShippingLabel( getState(), orderId, siteId ).form[ group ].values, group )
		.then( handleNormalizeResponse )
		.catch( ( error ) => {
			console.error( error );
			dispatch( NoticeActions.errorNotice( error.toString() ) );
		} );
};

export const updatePackageWeight = ( siteId, orderId, packageId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PACKAGE_WEIGHT,
		siteId,
		orderId,
		packageId,
		value,
	};
};

export const openPackage = ( siteId, orderId, openedPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_PACKAGE,
		siteId,
		orderId,
		openedPackageId,
	};
};

export const openItemMove = ( siteId, orderId, movedItemIndex ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ITEM_MOVE,
		siteId,
		orderId,
		movedItemIndex,
	};
};

export const moveItem = ( siteId, orderId, originPackageId, movedItemIndex, targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_MOVE_ITEM,
		siteId,
		orderId,
		originPackageId,
		movedItemIndex,
		targetPackageId,
	};
};

export const closeItemMove = ( siteId, orderId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ITEM_MOVE,
		siteId,
		orderId,
	};
};

export const setTargetPackage = ( siteId, orderId, targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_TARGET_PACKAGE,
		targetPackageId,
		siteId,
		orderId,
	};
};

export const openAddItem = ( siteId, orderId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_ADD_ITEM,
		siteId,
		orderId,
	};
};

export const closeAddItem = ( siteId, orderId, ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_ADD_ITEM,
		siteId,
		orderId,
	};
};

export const setAddedItem = ( siteId, orderId, sourcePackageId, movedItemIndex, added ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_ADDED_ITEM,
		siteId,
		orderId,
		sourcePackageId,
		movedItemIndex,
		added,
	};
};

export const addItems = ( siteId, orderId, targetPackageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_ITEMS,
		siteId,
		orderId,
		targetPackageId,
	};
};

export const addPackage = ( siteId, orderId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADD_PACKAGE,
		siteId,
		orderId,
	};
};

export const removePackage = ( siteId, orderId, packageId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REMOVE_PACKAGE,
		siteId,
		orderId,
		packageId,
	};
};

export const setPackageType = ( siteId, orderId, packageId, boxTypeId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_PACKAGE_TYPE,
		siteId,
		orderId,
		packageId,
		boxTypeId,
	};
};

export const savePackages = ( siteId, orderId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SAVE_PACKAGES,
		siteId,
		orderId,
	};
};

export const removeItem = ( siteId, orderId, packageId, itemIndex ) => ( dispatch, getState ) => {
	dispatch( moveItem( siteId, orderId, packageId, itemIndex, '' ) );

	const selected = getShippingLabel( getState(), orderId, siteId ).form.packages.selected;
	if ( selected[ packageId ] && 'individual' === selected[ packageId ].box_id ) {
		dispatch( removePackage( siteId, orderId, packageId ) );
		dispatch( openPackage( siteId, orderId, '' ) );
	}
};

export const confirmPackages = ( siteId, orderId ) => ( dispatch, getState ) => {
	const storeOptions = getShippingLabel( getState(), orderId, siteId ).storeOptions;
	dispatch( toggleStep( siteId, orderId, 'packages' ) );
	dispatch( savePackages( siteId, orderId ) );

	const handleResponse = () => {
		expandFirstErroneousStep( siteId, orderId, dispatch, getState, storeOptions, 'packages' );
	};

	getLabelRates( siteId, orderId, dispatch, getState, handleResponse, { orderId } );
};

export const updateRate = ( siteId, orderId, packageId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_RATE,
		siteId,
		orderId,
		packageId,
		value,
	};
};

export const updatePaperSize = ( siteId, orderId, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_UPDATE_PAPER_SIZE,
		siteId,
		orderId,
		value,
	};
};

const purchaseLabelResponse = ( siteId, orderId, response, error ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_RESPONSE, siteId, orderId, response, error };
};

const handleLabelPurchaseError = ( siteId, orderId, dispatch, getState, error ) => {
	dispatch( purchaseLabelResponse( siteId, orderId, null, true ) );
	if ( 'rest_cookie_invalid_nonce' === error ) {
		dispatch( exitPrintingFlow( siteId, orderId, true ) );
	} else {
		dispatch( NoticeActions.errorNotice( error ) );
		//re-request the rates on failure to avoid attempting repurchase of the same shipment id
		dispatch( clearAvailableRates( siteId, orderId ) );
		getLabelRates( siteId, orderId, dispatch, getState, _.noop, { orderId } );
	}
};

const pollForLabelsPurchase = ( siteId, orderId, dispatch, getState, labels ) => {
	const errorLabel = _.find( labels, { status: 'PURCHASE_ERROR' } );
	if ( errorLabel ) {
		handleLabelPurchaseError( siteId, orderId, dispatch, getState, errorLabel.error, orderId );
		return;
	}

	if ( ! _.every( labels, { status: 'PURCHASED' } ) ) {
		setTimeout( () => {
			const statusTasks = labels.map( ( label ) => (
				api.get( siteId, api.url.labelStatus( orderId, label.label_id ) )
					.then( ( statusResponse ) => statusResponse.label )
			) );

			Promise.all( statusTasks )
				.then( ( pollResponse ) => pollForLabelsPurchase( siteId, orderId, dispatch, getState, pollResponse ) )
				.catch( ( pollError ) => handleLabelPurchaseError( siteId, orderId, dispatch, getState, pollError ) );
		}, 1000 );
		return;
	}

	dispatch( purchaseLabelResponse( siteId, orderId, labels, false ) );

	const labelsToPrint = labels.map( ( label, index ) => ( {
		caption: __( 'PACKAGE %(num)d (OF %(total)d)', {
			args: {
				num: index + 1,
				total: labels.length,
			},
		} ),
		labelId: label.label_id,
	} ) );
	const state = getShippingLabel( getState(), orderId, siteId );
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
				dispatch( exitPrintingFlow( siteId, orderId, true ) );
				dispatch( clearAvailableRates() );
			} );
	}
};

export const purchaseLabel = () => ( siteId, orderId, dispatch, getState ) => {
	let error = null;
	let labels = null;

	const setError = ( err ) => error = err;
	const setSuccess = ( json ) => {
		labels = json.labels;
	};
	const setIsSaving = ( saving ) => {
		if ( saving ) {
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_PURCHASE_REQUEST, siteId, orderId } );
		} else if ( error ) {
			handleLabelPurchaseError( siteId, orderId, dispatch, getState, error );
		} else {
			pollForLabelsPurchase( siteId, orderId, dispatch, getState, labels );
		}
	};

	let form = getShippingLabel( getState(), orderId, siteId ).form;
	const addressNormalizationQueue = [];
	if ( ! form.origin.isNormalized ) {
		const task = normalizeAddress( siteId, orderId, dispatch, form.origin.values, 'origin' );
		addressNormalizationQueue.push( task );
	}
	if ( ! form.destination.isNormalized ) {
		const task = normalizeAddress( siteId, orderId, dispatch, form.destination.values, 'destination' );
		addressNormalizationQueue.push( task );
	}

	Promise.all( addressNormalizationQueue ).then( ( normalizationResults ) => {
		if ( ! _.every( normalizationResults ) ) {
			return;
		}
		const state = getShippingLabel( getState(), orderId, siteId );
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
		api.post( siteId, api.url.orderLabels( orderId ), formData )
			.then( setSuccess )
			.catch( setError )
			.then( () => setIsSaving( false ) );
	} ).catch( ( err ) => {
		console.error( err );
		dispatch( NoticeActions.errorNotice( err.toString() ) );
	} );
};

export const confirmPrintLabel = ( siteId, orderId, url ) => ( dispatch ) => {
	printDocument( url )
		.then( () => {
			dispatch( exitPrintingFlow( siteId, orderId, true ) );
			dispatch( clearAvailableRates() );
		} )
		.catch( ( error ) => dispatch( NoticeActions.errorNotice( error.toString() ) ) );
};

export const openRefundDialog = ( siteId, orderId, labelId ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REFUND_DIALOG,
		labelId,
		siteId,
		orderId,
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

export const closeRefundDialog = ( siteId, orderId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REFUND_DIALOG, siteId, orderId };
};

export const confirmRefund = ( siteId, orderId ) => ( dispatch, getState ) => {
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
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_REQUEST, siteId, orderId } );
		} else {
			dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_REFUND_RESPONSE, response, error, siteId, orderId } );
			if ( error ) {
				dispatch( NoticeActions.errorNotice( error.toString() ) );
			} else {
				dispatch( NoticeActions.successNotice( __( 'The refund request has been sent successfully.' ), { duration: 5000 } ) );
			}
		}
	};

	setIsSaving( true );
	api.post( siteId, api.url.labelRefund( orderId, labelId ) )
		.then( setSuccess )
		.catch( setError )
		.then( () => setIsSaving( false ) );
};

export const openReprintDialog = ( siteId, orderId, labelId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_OPEN_REPRINT_DIALOG, labelId, siteId, orderId };
};

export const closeReprintDialog = ( siteId, orderId ) => {
	return { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CLOSE_REPRINT_DIALOG, siteId, orderId };
};

export const confirmReprint = ( siteId, orderId ) => ( dispatch, getState ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CONFIRM_REPRINT, siteId, orderId } );
	const state = getState().shippingLabel;
	const labelId = state.reprintDialog.labelId;
	printDocument( getPrintURL( getState().shippingLabel.paperSize, [ { labelId } ] ) )
		.catch( ( error ) => {
			console.error( error );
			dispatch( NoticeActions.errorNotice( error.toString() ) );
		} )
		.then( () => dispatch( closeReprintDialog() ) );
};
