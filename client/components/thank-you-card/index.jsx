/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import React, { PropTypes } from 'react';

// Non standard gridicon sizes are used here because we use them as background pattern with various sizes and rotation
/* eslint-disable wpcalypso/jsx-gridicon-size */
const ThankYouCard = ( { heading, description, buttonUrl, buttonText, price, name } ) => (
	<div className="thank-you-card">
		<div className="thank-you-card__header">
			<Gridicon className="thank-you-card__main-icon" icon="checkmark-circle" size={ 140 } />

			<div>
				<div className={ classnames( 'thank-you-card__name', { 'is-placeholder': ! name } ) }>
					{ name }
				</div>
				<div className={ classnames( 'thank-you-card__price', { 'is-placeholder': ! price } ) }>
					{ price }
				</div>
			</div>

			<div className="thank-you-card__background-icons">
				<Gridicon icon="audio" size={ 52 } />
				<Gridicon icon="audio" size={ 20 } />
				<Gridicon icon="heart" size={ 52 } />
				<Gridicon icon="heart" size={ 41 } />
				<Gridicon icon="star" size={ 26 } />
				<Gridicon icon="status" size={ 52 } />
				<Gridicon icon="audio" size={ 38 } />
				<Gridicon icon="status" size={ 28 } />
				<Gridicon icon="status" size={ 65 } />
				<Gridicon icon="star" size={ 57 } />
				<Gridicon icon="star" size={ 33 } />
				<Gridicon icon="star" size={ 45 } />
			</div>
		</div>
		<div className="thank-you-card__body">
			<div className="thank-you-card__heading">
				{ heading }
			</div>
			<div className="thank-you-card__description">
				{ description }
			</div>
			<a
				className={ classnames( 'thank-you-card__button', { 'is-placeholder': ! buttonUrl } ) }
				href={ buttonUrl }>
				{ buttonText }
			</a>
		</div>
	</div>
);
/* eslint-enable wpcalypso/jsx-gridicon-size */

ThankYouCard.propTypes = {
	buttonText: PropTypes.string,
	buttonUrl: PropTypes.string,
	description: PropTypes.string,
	heading: PropTypes.string,
	name: PropTypes.string,
	price: PropTypes.string,
};

export default ThankYouCard;
