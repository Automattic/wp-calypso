/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import CreditCard from 'components/credit-card';
import NewCardForm from './new-card-form';
import { newCardPayment, storedCardPayment } from 'lib/store-transactions';
import { setPayment } from 'lib/upgrades/actions';

class CreditCardSelector extends React.Component {
	constructor( props ) {
		super( props );
		if ( props.initialCard ) {
			this.state = { section: props.initialCard.stored_details_id };
		} else {
			this.state = { section: 'new-card' };
		}
	}

	render() {
		return (
			<div className="payment-box-sections">
				{ this.storedCards() }
				{ this.newCardForm() }
			</div>
		);
	}

	storedCards = () => {
		return this.props.cards.map( card => {
			return (
				<CreditCard
					key={ card.stored_details_id }
					className="payment-box-section"
					card={ card }
					selected={ card.stored_details_id === this.state.section }
					onSelect={ this.handleClickedSection.bind( this, card.stored_details_id ) }
				/>
			);
		} );
	};

	newCardForm = () => {
		const classes = classNames( 'payment-box-section', {
			'no-stored-cards': this.props.cards.length === 0,
		} );

		return (
			<CreditCard
				key="new-card"
				className={ classes }
				selected={ 'new-card' === this.state.section }
				onSelect={ this.handleClickedSection.bind( this, 'new-card' ) }
			>
				<NewCardForm
					countriesList={ this.props.countriesList }
					transaction={ this.props.transaction }
					hasStoredCards={ this.props.cards.length > 0 }
				/>
			</CreditCard>
		);
	};

	handleClickedSection = section => {
		let newPayment;

		if ( section === this.state.section ) {
			return;
		}

		if ( 'new-card' === section ) {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Use a New Credit/Debit Card Link' );
			newPayment = newCardPayment( this.props.transaction.newCardRawDetails );
		} else {
			newPayment = storedCardPayment( this.getStoredCardDetails( section ) );
		}

		setPayment( newPayment );
		this.setState( { section: section } );
	};

	getStoredCardDetails = section => {
		return find( this.props.cards, { stored_details_id: section } );
	};
}

export default CreditCardSelector;
