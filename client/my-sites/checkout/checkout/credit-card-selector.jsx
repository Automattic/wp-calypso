/**
 * External dependencies
 */
import React from 'react';
import { find, defer } from 'lodash';
import { withStripeProps } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import {
	newCardPayment,
	newStripeCardPayment,
	storedCardPayment,
} from 'calypso/lib/transaction/payments';
import { setPayment } from 'calypso/lib/transaction/actions';

class CreditCardSelector extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { section: props.initialCard ? props.initialCard.stored_details_id : 'new-card' };
	}

	render() {
		return null;
	}

	componentDidMount() {
		// This defer is needed to avoid a dispatch within a dispatch when
		// Flux drives the transition from domains to checkout
		// We should be able to remove it when we reduxify either the CartStore
		// or TransitionStore. (see also SecurePaymentForm::setInitialPaymentDetails()
		// and NewCardForm::handleFieldChange())
		defer( () => this.savePayment( this.state.section ) );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.stripe !== this.props.stripe ) {
			defer( () => this.savePayment( this.state.section ) );
		}
	}

	handleClickedSection = ( section ) => {
		if ( section === this.state.section ) {
			return;
		}
		if ( 'new-card' === section ) {
			gaRecordEvent( 'Upgrades', 'Clicked Use a New Credit/Debit Card Link' );
		}
		this.savePayment( section );
		this.setState( { section: section } );
	};

	savePayment = ( section ) => {
		if ( 'new-card' === section ) {
			if ( this.props.stripe ) {
				return setPayment( newStripeCardPayment( this.props.transaction.newCardRawDetails ) );
			}

			return setPayment( newCardPayment( this.props.transaction.newCardRawDetails ) );
		}
		setPayment( storedCardPayment( this.getStoredCardDetails( section ) ) );
	};

	getStoredCardDetails = ( section ) => {
		return find( this.props.cards, { stored_details_id: section } );
	};
}

export default withStripeProps( CreditCardSelector );
