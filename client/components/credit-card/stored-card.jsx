/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

class StoredCard extends React.Component {
	static propTypes = {
		card: PropTypes.string.isRequired,
		cardType: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		expiry: PropTypes.string.isRequired,
	};

	render() {
		const { card, cardType, name, expiry } = this.props;
		const expirationDate = this.props.moment( expiry ).format( 'MM/YY' );

		const type = cardType && cardType.toLocaleLowerCase();
		const cardClasses = classNames( 'credit-card__stored-card', {
			'is-amex': type === 'amex',
			'is-diners': type === 'diners',
			'is-discover': type === 'discover',
			'is-jcb': type === 'jcb',
			'is-mastercard': type === 'mastercard',
			'is-unionpay': type === 'unionpay',
			'is-visa': type === 'visa',
		} );

		return (
			<div className={ cardClasses }>
				<span className="credit-card__stored-card-number">
					{ cardType } ****{ card }
				</span>
				<span className="credit-card__stored-card-name">{ name }</span>
				<span className="credit-card__stored-card-expiration-date">
					{ this.props.translate( 'Expires %(date)s', {
						args: { date: expirationDate },
						context: 'date is of the form MM/YY',
					} ) }
				</span>
			</div>
		);
	}
}

export default localize( StoredCard );
