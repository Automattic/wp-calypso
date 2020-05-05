/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Card from '..';
import CompactCard from '../compact';

Card.displayName = 'Card';
CompactCard.displayName = 'CompactCard';

class Cards extends React.Component {
	static displayName = 'Card';

	state = {
		compactCards: false,
	};

	static defaultProps = {
		exampleCode: (
			<div>
				<Card>I am a Card.</Card>
				<Card>I am another Card.</Card>
				<Card className="docs__awesome sauce">I am a third Card with custom classes!</Card>
				<Card href="#cards">I am a linkable Card</Card>
				<Card href="#cards" target="_blank" rel="noopener noreferrer">
					I am a externally linked Card
				</Card>
				<Card
					tagName="button"
					displayAsLink
					onClick={ function () {
						alert( 'Thank you for clicking me!' );
					} }
				>
					I am a clickable button that looks like a link
				</Card>
				<Card highlight="info">I am a Card, highlighted as info</Card>
				<Card highlight="success">I am a Card, highlighted as success</Card>
				<Card highlight="error">I am a Card, highlighted as error</Card>
				<Card highlight="warning">I am a Card, highlighted as warning</Card>
				<CompactCard>I am a CompactCard.</CompactCard>
				<CompactCard>I am another CompactCard.</CompactCard>
			</div>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}

export default Cards;
