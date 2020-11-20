/**
 * External dependencies
 */
import React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import {
	Button,
	FormStatus,
	useLineItems,
	useFormStatus,
	useEvents,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import WordPressLogo from '../components/wordpress-logo';

export function createFullCreditsMethod() {
	return {
		id: 'full-credits',
		label: <WordPressCreditsLabel />,
		submitButton: <FullCreditsSubmitButton />,
		inactiveContent: <WordPressCreditsSummary />,
		getAriaLabel: ( __ ) => __( 'Credits' ),
	};
}

function FullCreditsSubmitButton( { disabled, onClick } ) {
	const [ items ] = useLineItems();
	const { responseCart } = useShoppingCart();
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();

	const handleButtonPress = () => {
		onEvent( { type: 'FULL_CREDITS_TRANSACTION_BEGIN' } );
		onClick( 'full-credits', {
			items,
		} );
	};

	return (
		<Button
			disabled={ disabled }
			onClick={ handleButtonPress }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents
				formStatus={ formStatus }
				total={ responseCart.sub_total_with_taxes_display }
			/>
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return __( 'Processing…' );
	}
	if ( formStatus === FormStatus.READY ) {
		return sprintf( __( 'Pay %s with credits' ), total );
	}
	return __( 'Please wait…' );
}

function WordPressCreditsLabel() {
	const { __ } = useI18n();
	const { responseCart } = useShoppingCart();

	return (
		<React.Fragment>
			<div>
				{ sprintf( __( 'WordPress.com Credits: %(amount)s available' ), {
					amount: responseCart.credits_display,
				} ) }
			</div>
			<WordPressLogo />
		</React.Fragment>
	);
}

function WordPressCreditsSummary() {
	const { __ } = useI18n();
	return <div>{ __( 'WordPress.com Credits' ) }</div>;
}
