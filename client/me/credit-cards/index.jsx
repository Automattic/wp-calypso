/**
 * External dependencies
 */
var connect = require( 'react-redux' ).connect,
	React = require( 'react' );

/**
 * Internal dependencies
 */
var CreditCardDelete = require( './credit-card-delete' ),
	Card = require( 'components/card' ),
	getStoredCards = require( 'state/stored-cards/selectors' ).getStoredCards,
	hasLoadedStoredCardsFromServer = require( 'state/stored-cards/selectors' ).hasLoadedStoredCardsFromServer,
	isFetchingStoredCards = require( 'state/stored-cards/selectors' ).isFetchingStoredCards,
	QueryStoredCards = require( 'components/data/query-stored-cards' ),
	SectionHeader = require( 'components/section-header' );

var CreditCards = React.createClass( {
	renderCards: function() {
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
				<div className="credit-cards_single-card" key={ card.stored_details_id }>
					<CreditCardDelete card={ card } />
				</div>
			);
		}, this );
	},

	render: function() {
		return (
			<div>
				<QueryStoredCards />

				<SectionHeader label={ this.translate( 'Manage Your Credit Cards' ) } />

				<Card>
					<div className="credit-cards">
						{ this.renderCards() }
					</div>
				</Card>
			</div>
		);
	}
} );

module.exports = connect(
	state => ( {
		cards: getStoredCards( state ),
		hasLoadedFromServer: hasLoadedStoredCardsFromServer( state ),
		isFetching: isFetchingStoredCards( state )
	} )
)( CreditCards );
