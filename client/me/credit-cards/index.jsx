/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:credit-cards' );

/**
 * Internal dependencies
 */
var CreditCardDelete = require( './credit-card-delete' ),
	observe = require( 'lib/mixins/data-observe' ),
	Card = require( 'components/card' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {

	displayName: 'CreditCards',

	mixins: [ observe( 'cards' ) ],

	renderCards: function() {
		var cards = this.props.cards.get();

		// Loading state
		if ( ! this.props.cards.initialized ) {
			return (
				<div className="credit-cards__no-results">
					{ this.translate( 'Loading…' ) }
				</div>
			);
		}

		// No cards
		if ( ! cards.length ) {
			return (
				<div className="credit-cards__no-results">
					{ this.translate( 'You have no saved cards.' ) }
				</div>
			);
		}

		// Show cards
		return cards.map( function( card ) {
			return (
				<div className="credit-cards_single-card" key={ card.stored_details_id }>
					<CreditCardDelete card={ card } cards={ this.props.cards } />
				</div>
			);
		}, this );
	},

	render: function() {
		debug( 'Render credit cards' );
		return (
			<div>
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
