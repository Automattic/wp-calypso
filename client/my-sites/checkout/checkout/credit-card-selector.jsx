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
import StoredCard from './stored-card';
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
		return this.props.cards.map( function( card ) {
			const storedCard = <StoredCard card={ card } />;
			return this.section( card.stored_details_id, storedCard );
		}, this );
	};

	newCardForm = () => {
		const cardForm = (
			<NewCardForm
				countriesList={ this.props.countriesList }
				transaction={ this.props.transaction }
				hasStoredCards={ this.props.cards.length > 0 }
			/>
		);

		return this.section( 'new-card', cardForm );
	};

	section = ( name, content ) => {
		const classes = classNames( 'payment-box-section', {
			selected: this.state.section === name,
			'no-stored-cards': name === 'new-card' && this.props.cards.length === 0,
		} );

		return (
			<div
				className={ classes }
				onClick={ this.handleClickedSection.bind( this, name ) }
				key={ name }
			>
				<div className="payment-box-section-inner">{ content }</div>
			</div>
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
