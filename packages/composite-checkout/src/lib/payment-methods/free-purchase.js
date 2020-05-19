/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import {
	useSelect,
	useDispatch,
	useMessages,
	useLineItems,
	useEvents,
	renderDisplayValueMarkdown,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { useFormStatus } from '../form-status';

const debug = debugFactory( 'composite-checkout:free-purchase-payment-method' );

export function createFreePaymentMethod( { registerStore, submitTransaction } ) {
	const actions = {
		*beginFreeTransaction( payload ) {
			let response;
			try {
				response = yield {
					type: 'FREE_TRANSACTION_BEGIN',
					payload,
				};
				debug( 'free transaction complete', response );
			} catch ( error ) {
				debug( 'free transaction had an error', error.message );
				return { type: 'FREE_PURCHASE_TRANSACTION_ERROR', payload: error.message };
			}
			debug( 'free transaction requires is successful' );
			return { type: 'FREE_PURCHASE_TRANSACTION_END', payload: response };
		},
	};

	const selectors = {
		getTransactionError( state ) {
			return state.transactionError;
		},
		getTransactionStatus( state ) {
			return state.transactionStatus;
		},
	};

	registerStore( 'free-purchase', {
		reducer(
			state = {
				transactionStatus: null,
				transactionError: null,
			},
			action
		) {
			switch ( action.type ) {
				case 'FREE_PURCHASE_TRANSACTION_END':
					return {
						...state,
						transactionStatus: 'complete',
					};
				case 'FREE_PURCHASE_TRANSACTION_ERROR':
					return {
						...state,
						transactionStatus: 'error',
						transactionError: action.payload,
					};
			}
			return state;
		},
		actions,
		selectors,
		controls: {
			FREE_TRANSACTION_BEGIN( action ) {
				return submitTransaction( action.payload );
			},
		},
	} );

	return {
		id: 'free-purchase',
		label: <FreePurchaseLabel />,
		submitButton: <FreePurchaseSubmitButton />,
		inactiveContent: <FreePurchaseSummary />,
		getAriaLabel: ( localize ) => localize( 'Free' ),
	};
}

function FreePurchaseLabel() {
	const localize = useLocalize();

	return (
		<React.Fragment>
			<div>{ localize( 'Free Purchase' ) }</div>
		</React.Fragment>
	);
}

function FreePurchaseSubmitButton( { disabled } ) {
	const localize = useLocalize();
	const { beginFreeTransaction } = useDispatch( 'free-purchase' );
	const [ items, total ] = useLineItems();
	const transactionStatus = useSelect( ( select ) =>
		select( 'free-purchase' ).getTransactionStatus()
	);
	const transactionError = useSelect( ( select ) =>
		select( 'free-purchase' ).getTransactionError()
	);
	const { showErrorMessage } = useMessages();
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const onEvent = useEvents();

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			onEvent( { type: 'FREE_PURCHASE_TRANSACTION_ERROR', payload: transactionError || '' } );
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			setFormReady();
		}
		if ( transactionStatus === 'complete' ) {
			debug( 'free transaction is complete' );
			setFormComplete();
		}
	}, [
		onEvent,
		setFormReady,
		setFormComplete,
		showErrorMessage,
		transactionStatus,
		transactionError,
		localize,
	] );

	const onClick = () => {
		setFormSubmitting();
		onEvent( { type: 'FREE_TRANSACTION_BEGIN' } );
		beginFreeTransaction( {
			items,
		} );
	};

	return (
		<Button
			disabled={ disabled }
			onClick={ onClick }
			buttonState={ disabled ? 'disabled' : 'primary' }
			isBusy={ 'submitting' === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const localize = useLocalize();
	if ( formStatus === 'submitting' ) {
		return localize( 'Processing…' );
	}
	if ( formStatus === 'ready' ) {
		return sprintf(
			localize( 'Complete Checkout' ),
			renderDisplayValueMarkdown( total.amount.displayValue )
		);
	}
	return localize( 'Please wait…' );
}

function FreePurchaseSummary() {
	const localize = useLocalize();
	return <div>{ localize( 'Free Purchase' ) }</div>;
}
