/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { find, defer } from 'lodash';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import CreditCard from 'components/credit-card';
import NewCardForm from './new-card-form';
import { newCardPayment, newStripeCardPayment, storedCardPayment } from 'lib/transaction/payments';
import { setPayment } from 'lib/transaction/actions';
import { withStripeProps } from 'lib/stripe';

class CreditCardSelector extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { section: props.initialCard ? props.initialCard.stored_details_id : 'new-card' };
	}

	render() {
		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div className="payment-box-sections">
				{ this.storedCards() }
				{ this.newCardForm() }
			</div>
		);
	}

	storedCards = () => {
		return this.props.cards.map( card => {
			const onSelect = () => this.handleClickedSection( card.stored_details_id );
			return (
				<CreditCard
					key={ card.stored_details_id }
					className="checkout__payment-box-section"
					card={ {
						lastDigits: card.card,
						cardType: card.card_type,
						name: card.name,
						expiry: card.expiry,
					} }
					selected={ card.stored_details_id === this.state.section }
					onSelect={ onSelect }
				/>
			);
		} );
	};

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

	newCardForm = () => {
		const onSelect = () => this.handleClickedSection( 'new-card' );
		const classes = classNames( 'checkout__payment-box-section', {
			'no-stored-cards': this.props.cards.length === 0,
		} );
		const selected = 'new-card' === this.state.section;

		return (
			<CreditCard key="new-card" className={ classes } selected={ selected } onSelect={ onSelect }>
				<NewCardForm
					countriesList={ this.props.countriesList }
					transaction={ this.props.transaction }
					hasStoredCards={ this.props.cards.length > 0 }
					selected={ selected }
				/>
			</CreditCard>
		);
	};

	handleClickedSection = section => {
		if ( section === this.state.section ) {
			return;
		}
		if ( 'new-card' === section ) {
			gaRecordEvent( 'Upgrades', 'Clicked Use a New Credit/Debit Card Link' );
		}
		this.savePayment( section );
		this.setState( { section: section } );
	};

	savePayment = section => {
		if ( 'new-card' === section ) {
			if ( this.props.stripe ) {
				return setPayment( newStripeCardPayment( this.props.transaction.newCardRawDetails ) );
			}

			return setPayment( newCardPayment( this.props.transaction.newCardRawDetails ) );
		}
		setPayment( storedCardPayment( this.getStoredCardDetails( section ) ) );
	};

	getStoredCardDetails = section => {
		return find( this.props.cards, { stored_details_id: section } );
	};
}

export default withStripeProps( CreditCardSelector );
