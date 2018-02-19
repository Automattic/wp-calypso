/**
 * External dependencies
 *
 * @format
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';

const CTACard = props => (
	<Card className="select-business-type__cta-card">
		<div className="select-business-type__cta-card-main">
			<h2>{ props.headerText }</h2>
			<p>{ props.mainText }</p>
		</div>
		<div className="select-business-type__cta-card-button-container">
			<Button primary={ props.buttonPrimary }>
				{ props.buttonText } <Gridicon icon={ props.buttonIcon } />
			</Button>
		</div>
	</Card>
);

export default CTACard;
