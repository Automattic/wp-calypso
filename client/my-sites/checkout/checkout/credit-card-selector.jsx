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
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div className="payment-box-sections">
				{ this.storedCards() }
				{ this.newCardForm() }
			</div>
		);
	}

	storedCards = () => {
		return this.props.cards.map( card => {
			const onSelect = this.handleClickedSection.bind( this, card.stored_details_id );
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
		this.savePayment( this.state.section );
	}

	newCardForm = () => {
		const onSelect = this.handleClickedSection.bind( this, 'new-card' );
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
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Use a New Credit/Debit Card Link' );
		}
		this.savePayment( section );
		this.setState( { section: section } );
	};

	savePayment = section => {
		let newPayment;
		if ( 'new-card' === section ) {
			newPayment = newCardPayment( this.props.transaction.newCardRawDetails );
		} else {
			newPayment = storedCardPayment( this.getStoredCardDetails( section ) );
		}
		setPayment( newPayment );
	};

	getStoredCardDetails = section => {
		return find( this.props.cards, { stored_details_id: section } );
	};
}

export default CreditCardSelector;
