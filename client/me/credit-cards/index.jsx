/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CreditCardDelete from './credit-card-delete';
import {
	getStoredCards,
	hasLoadedStoredCardsFromServer,
	isFetchingStoredCards
} from 'state/stored-cards/selectors';
import QueryStoredCards from 'components/data/query-stored-cards';
import SectionHeader from 'components/section-header';

class CreditCards extends Component {
	renderCards() {
		if ( this.props.isFetching && ! this.props.hasLoadedFromServer ) {
			return (
				<div className="credit-cards__no-results">
					{ this.translate( 'Loading…' ) }
				</div>
			);
		}

		if ( ! this.props.cards.length ) {
			return (
				<div className="credit-cards__no-results">
					{ this.translate( 'You have no saved cards.' ) }
				</div>
			);
		}

		return this.props.cards.map( function( card ) {
			return (
				<div className="credit-cards__single-card" key={ card.stored_details_id }>
					<CreditCardDelete card={ card } />
				</div>
			);
		}, this );
	}

	render() {
		return (
			<div className="credit-cards">
				<QueryStoredCards />

				<SectionHeader label={ this.translate( 'Manage Your Credit Cards' ) } />

				<Card>
					<div>
						{ this.renderCards() }
					</div>
				</Card>
			</div>
		);
	}
}

export default connect(
	state => ( {
		cards: getStoredCards( state ),
		hasLoadedFromServer: hasLoadedStoredCardsFromServer( state ),
		isFetching: isFetchingStoredCards( state )
	} )
)( CreditCards );
