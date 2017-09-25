/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

import CompactCard from 'components/card/compact';

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
			<div>
				<a className="docs__design-toggle button" onClick={ this.toggleCards }>{ toggleCardsText }</a>
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
					<Card highlight="info">I am a Card, highlighted as info</Card>
					<Card highlight="success">I am a Card, highlighted as success</Card>
					<Card highlight="error">I am a Card, highlighted as error</Card>
					<Card highlight="warning">I am a Card, highlighted as warning</Card>
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
					<CompactCard highlight="info">I am a CompactCard, highlighted as info</CompactCard>
					<CompactCard highlight="success">I am a CompactCard, highlighted as success</CompactCard>
					<CompactCard highlight="error">I am a CompactCard, highlighted as error</CompactCard>
					<CompactCard highlight="warning">I am a CompactCard, highlighted as warning</CompactCard>
				</div>
			);
		}
	},

	toggleCards: function() {
		this.setState( { compactCards: ! this.state.compactCards } );
	}
} );

export default Cards;
