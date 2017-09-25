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
import storeTransactions from 'lib/store-transactions';
import upgradesActions from 'lib/upgrades/actions';

const CreditCardSelector = React.createClass( {
	getInitialState: function() {
		if ( this.props.initialCard ) {
			return { section: this.props.initialCard.stored_details_id };
		} else {
			return { section: 'new-card' };
		}
	},

	render: function() {
		return (
			<div className="payment-box-sections">
				{ this.storedCards() }
				{ this.newCardForm() }
			</div>
		);
	},

	storedCards: function() {
		return this.props.cards.map( function( card ) {
			const storedCard = <StoredCard card={ card } />;
			return this.section( card.stored_details_id, storedCard );
		}, this );
	},

	newCardForm: function() {
		const cardForm = (
			<NewCardForm
				countriesList={ this.props.countriesList }
				transaction={ this.props.transaction }
				hasStoredCards={ this.props.cards.length > 0 } />
		);

		return this.section( 'new-card', cardForm );
	},

	section: function( name, content ) {
		const classes = classNames( 'payment-box-section', {
			selected: this.state.section === name,
			'no-stored-cards': name === 'new-card' && this.props.cards.length === 0
		} );

		return (
			<div className={ classes }
					onClick={ this.handleClickedSection.bind( this, name ) }
					key={ name }>
				<div className="payment-box-section-inner">
					{ content }
				</div>
			</div>
		);
	},

	handleClickedSection: function( section ) {
		let newPayment;

		if ( section === this.state.section ) {
			return;
		}

		if ( 'new-card' === section ) {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Use a New Credit/Debit Card Link' );
			newPayment = storeTransactions.newCardPayment( this.props.transaction.newCardFormFields );
		} else {
			newPayment = storeTransactions.storedCardPayment( this.getStoredCardDetails( section ) );
		}

		upgradesActions.setPayment( newPayment );
		this.setState( { section: section } );
	},

	getStoredCardDetails: function( section ) {
		return find( this.props.cards, { stored_details_id: section } );
	}
} );

export default CreditCardSelector;
