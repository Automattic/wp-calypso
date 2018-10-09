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

/**
 * Style dependencies
 */
import './style.scss';

const ActionCard = ( {
	headerText,
	mainText,
	buttonPrimary,
	buttonText,
	buttonIcon,
	buttonTarget,
	buttonHref,
	buttonOnClick,
	children,
	compact,
	buttonDisabled,
	illustration,
} ) => (
	<Card className="action-card" compact={ compact }>
		{ illustration && (
			<img
				className="action-card__illustration"
				alt="concierge session signup form header"
				src={ illustration }
			/>
		) }
		<div className="action-card__main">
			<h2 className="action-card__heading">{ headerText }</h2>
			<p>{ mainText }</p>
		</div>
		<div className="action-card__button-container">
			{ children || (
				<Button
					primary={ buttonPrimary }
					href={ buttonHref }
					target={ buttonTarget }
					onClick={ buttonOnClick }
					disabled={ buttonDisabled }
				>
					{ buttonText } { buttonIcon && <Gridicon icon={ buttonIcon } /> }
				</Button>
			) }
		</div>
	</Card>
);

ActionCard.propTypes = {
	headerText: PropTypes.string.isRequired,
	mainText: PropTypes.string.isRequired,
	buttonPrimary: PropTypes.bool,
	buttonText: PropTypes.string,
	buttonIcon: PropTypes.string,
	buttonOnClick: PropTypes.func,
	buttonHref: PropTypes.string,
	buttonTarget: PropTypes.string,
	buttonDisabled: PropTypes.bool,
	children: PropTypes.any,
	compact: PropTypes.bool,
	illustration: PropTypes.string,
};

ActionCard.defaultProps = {
	compact: true,
	buttonDisabled: false,
};

export default ActionCard;
