/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

export const getCreditCardSummary = ( translate, type, digits ) => {
	const supportedTypes = {
		amex: translate( 'American Express' ),
		discover: translate( 'Discover' ),
		mastercard: translate( 'MasterCard' ),
		visa: translate( 'VISA' ),
		diners: translate( 'Diners Club' ),
		jcb: translate( 'JCB' ),
		unionpay: translate( 'UnionPay' ),
	};

	const displayType = supportedTypes[ type && type.toLowerCase() ] || type;

	if ( ! digits ) {
		return displayType;
	}

	return translate( '%(displayType)s ****%(digits)s', {
		args: { displayType, digits },
	} );
};

export const cardType = PropTypes.shape( {
	card: PropTypes.string,
	card_type: PropTypes.string,
	name: PropTypes.string,
	expiry: PropTypes.string,
} );

class StoredCard extends React.Component {
	static propTypes = {
		card: cardType,
	};

	render() {
		const card = this.props.card;
		const expirationDate = this.props.moment( card.expiry ).format( 'MM/YY' );
		const cardClasses = classNames(
			'credit-card__stored-card',
			card.card_type && card.card_type.toLowerCase()
		);

		return (
			<div className={ cardClasses }>
				<span className="credit-card__stored-card-number">
					{ getCreditCardSummary( this.props.translate, card.card_type, card.card ) }
				</span>
				<span className="credit-card__stored-card-name">{ card.name }</span>
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
