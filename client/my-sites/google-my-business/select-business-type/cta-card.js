/** @format */

/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';

const CTACard = ( { headerText, mainText, buttonPrimary, buttonText, buttonIcon } ) => (
	<Card className="select-business-type__cta-card">
		<div className="select-business-type__cta-card-main">
			<h2>{ headerText }</h2>
			<p>{ mainText }</p>
		</div>
		<div className="select-business-type__cta-card-button-container">
			<Button primary={ buttonPrimary }>
				{ buttonText } <Gridicon icon={ buttonIcon } />
			</Button>
		</div>
	</Card>
);

CTACard.propTypes = {
	headerText: PropTypes.string.isRequired,
	mainText: PropTypes.string.isRequired,
	buttonPrimary: PropTypes.bool,
	buttonText: PropTypes.string.isRequired,
	buttonIcon: PropTypes.string.isRequired,
};

export default CTACard;
