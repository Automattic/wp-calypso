/** @format */

/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

class StoredCard extends React.Component {
	static displayName = 'StoredCard';

	render() {
		const card = this.props.card,
			expirationDate = this.props.moment( card.expiry ).format( 'MM/YY' ),
			cardClasses = `stored-card ${
				card.card_type === 'american express' ? 'amex' : card.card_type.toLowerCase()
			}`;

		return (
			<div className={ cardClasses }>
				<span className="checkout__stored-card-number">
					{ card.card_type } ****
					{ card.card }
				</span>
				<span className="checkout__stored-card-name">{ card.name }</span>
				<span className="checkout__stored-card-expiration-date">
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
