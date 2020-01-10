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
	renderDisplayValueMarkdown,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { useFormStatus } from '../form-status';

const debug = debugFactory( 'composite-checkout:full-credits-payment-method' );

export function createFullCreditsMethod( {
	registerStore,
	submitTransaction,
	creditsDisplayValue,
	label,
	summary,
	buttonText,
} ) {
	const actions = {
		*beginCreditsTransaction( payload ) {
			let response;
			try {
				response = yield {
					type: 'FULL_CREDITS_TRANSACTION_BEGIN',
					payload,
				};
				debug( 'full credits transaction complete', response );
			} catch ( error ) {
				debug( 'full credits transaction had an error', error );
				return { type: 'FULL_CREDITS_TRANSACTION_ERROR', payload: error };
			}
			debug( 'full credits transaction requires is successful' );
			return { type: 'FULL_CREDITS_TRANSACTION_END', payload: response };
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

	registerStore( 'full-credits', {
		reducer(
			state = {
				transactionStatus: null,
				transactionError: null,
			},
			action
		) {
			switch ( action.type ) {
				case 'FULL_CREDITS_TRANSACTION_END':
					return {
						...state,
						transactionStatus: 'complete',
					};
				case 'FULL_CREDITS_TRANSACTION_ERROR':
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
			FULL_CREDITS_TRANSACTION_BEGIN( action ) {
				return submitTransaction( action.payload );
			},
		},
	} );

	return {
		id: 'full-credits',
		label: label || <FullCreditsLabel creditsDisplayValue={ creditsDisplayValue } />,
		submitButton: <FullCreditsSubmitButton buttonText={ buttonText } />,
		inactiveContent: summary || <FullCreditsSummary />,
		getAriaLabel: localize => localize( 'Credits' ),
	};
}

function FullCreditsLabel( { creditsDisplayValue } ) {
	const localize = useLocalize();

	return (
		<React.Fragment>
			<div>{ localize( 'Credits' ) }</div>
			<div>{ sprintf( localize( 'You have %s in credits available.' ), creditsDisplayValue ) }</div>
		</React.Fragment>
	);
}

function FullCreditsSubmitButton( { disabled, buttonText } ) {
	const localize = useLocalize();
	const { beginCreditsTransaction } = useDispatch( 'full-credits' );
	const [ items, total ] = useLineItems();
	const transactionStatus = useSelect( select => select( 'full-credits' ).getTransactionStatus() );
	const transactionError = useSelect( select => select( 'full-credits' ).getTransactionError() );
	const { showErrorMessage } = useMessages();
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			setFormReady();
		}
		if ( transactionStatus === 'complete' ) {
			debug( 'full credits transaction is complete' );
			setFormComplete();
		}
	}, [
		setFormReady,
		setFormComplete,
		showErrorMessage,
		transactionStatus,
		transactionError,
		localize,
	] );

	const onClick = () => {
		setFormSubmitting();
		beginCreditsTransaction( {
			items,
		} );
	};
	const buttonString =
		formStatus === 'submitting'
			? localize( 'Processing...' )
			: buttonText ||
			  sprintf(
					localize( 'Pay %s with Credits' ),
					renderDisplayValueMarkdown( total.amount.displayValue )
			  );
	return (
		<Button
			disabled={ disabled }
			onClick={ onClick }
			buttonState={ disabled ? 'disabled' : 'primary' }
			fullWidth
		>
			{ buttonString }
		</Button>
	);
}

function FullCreditsSummary() {
	const localize = useLocalize();
	return localize( 'Pay using Credits' );
}
