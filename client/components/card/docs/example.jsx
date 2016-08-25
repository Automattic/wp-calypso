/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	CompactCard = require( 'components/card/compact' );

var Cards = React.createClass( {
	displayName: 'Cards',

	getInitialState: function() {
		return {
			compactCards: false
		};
	},

	render: function() {
		var toggleCardsText = this.state.compactCards ? 'Normal Cards' : 'Compact Cards';

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/cards">Card</a>
					<a className="design-assets__toggle button" onClick={ this.toggleCards }>{ toggleCardsText }</a>
				</h2>
				{ this.renderCards() }
			</div>
		);
	},

	renderCards: function() {
		if ( ! this.state.compactCards ) {
			return (
				<div>
					<Card>I am a Card.</Card>
					<Card>I am another Card.</Card>
					<Card className="awesome sauce">I am a third Card with custom classes!</Card>
					<Card href="#cards">I am a linkable Card</Card>
					<Card href="#cards" target="_blank" rel="noopener noreferrer">I am a externally linked Card</Card>
				</div>
			);
		} else {
			return (
				<div>
					<CompactCard>I am a CompactCard.</CompactCard>
					<CompactCard>I am another CompactCard.</CompactCard>
					<CompactCard className="awesome sauce">I am a third CompactCard with custom classes!</CompactCard>
					<CompactCard href="#cards">I am a linkable CompactCard</CompactCard>
					<CompactCard href="#cards" target="_blank" rel="noopener noreferrer">I am a externally linked CompactCard</CompactCard>
				</div>
			);
		}
	},

	toggleCards: function() {
		this.setState( { compactCards: ! this.state.compactCards } );
	}
} );

module.exports = Cards;
