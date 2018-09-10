/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import GridiconStatus from 'gridicons/dist/status';
import GridiconStar from 'gridicons/dist/star';
import GridiconHeart from 'gridicons/dist/heart';
import GridiconAudio from 'gridicons/dist/audio';
import GridiconCheckmarkCircle from 'gridicons/dist/checkmark-circle';

// Non standard gridicon sizes are used here because we use them as background pattern with various sizes and rotation
/* eslint-disable wpcalypso/jsx-gridicon-size */

const ThankYouCard = ( {
	heading,
	description,
	descriptionWithHTML,
	buttonUrl,
	buttonText,
	price,
	name,
	icon,
	action,
} ) => {
	const renderAction = () => {
		if ( action ) {
			return action;
		}

		return (
			<a
				className={ classnames( 'thank-you-card__button', { 'is-placeholder': ! buttonUrl } ) }
				href={ buttonUrl }
			>
				{ buttonText }
			</a>
		);
	};

	return (
		<div className="thank-you-card">
			<div className="thank-you-card__header">
				{ icon ? (
					<div className="thank-you-card__main-icon">{ icon }</div>
				) : (
					<GridiconCheckmarkCircle className="thank-you-card__main-icon" size={ 140 } />
				) }

				<div className="thank-you-card__header-detail">
					<div className={ classnames( 'thank-you-card__name', { 'is-placeholder': ! name } ) }>
						{ name }
					</div>
					<div className={ classnames( 'thank-you-card__price', { 'is-placeholder': ! price } ) }>
						{ price }
					</div>
				</div>

				<div className="thank-you-card__background-icons">
					<GridiconAudio size={ 52 } />
					<GridiconAudio size={ 20 } />
					<GridiconHeart size={ 52 } />
					<GridiconHeart size={ 41 } />
					<GridiconStar size={ 26 } />
					<GridiconStatus size={ 52 } />
					<GridiconAudio size={ 38 } />
					<GridiconStatus size={ 28 } />
					<GridiconStatus size={ 65 } />
					<GridiconStar size={ 57 } />
					<GridiconStar size={ 33 } />
					<GridiconStar size={ 45 } />
				</div>
			</div>
			<div className="thank-you-card__body">
				<div className="thank-you-card__heading">{ heading }</div>
				<div className="thank-you-card__description">
					{ description }
					{ descriptionWithHTML }
				</div>

				<div className="thank-you-card__action">{ renderAction() }</div>
			</div>
		</div>
	);
};
/* eslint-enable wpcalypso/jsx-gridicon-size */

ThankYouCard.propTypes = {
	buttonText: PropTypes.string,
	buttonUrl: PropTypes.string,
	description: PropTypes.string,
	descriptionWithHTML: PropTypes.object,
	heading: PropTypes.string,
	name: PropTypes.string,
	price: PropTypes.string,
	icon: PropTypes.node,
	action: PropTypes.node,
};

export default ThankYouCard;
