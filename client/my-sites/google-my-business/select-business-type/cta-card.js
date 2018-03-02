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
import CompactCard from 'components/card/compact';
import Button from 'components/button';

const CTACard = ( {
	headerText,
	mainText,
	buttonPrimary,
	buttonText,
	buttonIcon,
	buttonTarget,
	buttonHref,
	buttonOnClick,
} ) => (
	<CompactCard className="select-business-type__cta-card">
		<div className="select-business-type__cta-card-main">
			<h2 className="select-business-type__cta-card-heading">{ headerText }</h2>
			<p>{ mainText }</p>
		</div>
		<div className="select-business-type__cta-card-button-container">
			<Button
				className="select-business-type__cta-card-button"
				primary={ buttonPrimary }
				href={ buttonHref }
				target={ buttonTarget }
				onClick={ buttonOnClick }
			>
				{ buttonText } { buttonIcon && <Gridicon icon={ buttonIcon } /> }
			</Button>
		</div>
	</CompactCard>
);

CTACard.propTypes = {
	headerText: PropTypes.string.isRequired,
	mainText: PropTypes.string.isRequired,
	buttonPrimary: PropTypes.bool,
	buttonText: PropTypes.string.isRequired,
	buttonIcon: PropTypes.string,
	buttonOnClick: PropTypes.func,
	buttonHref: PropTypes.string,
	buttonTarget: PropTypes.string,
};

export default CTACard;
