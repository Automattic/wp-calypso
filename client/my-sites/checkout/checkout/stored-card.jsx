/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	displayName: 'StoredCard',

	render: function() {
		let card = this.props.card,
			expirationDate = this.moment( card.expiry ).format( 'MM/YY' ),
			cardClasses = 'stored-card ' + card.card_type.toLowerCase();

		return (
			<div className={ cardClasses }>
				<span className="stored-card__number">{ card.card_type } ****{ card.card }</span>
				<span className="stored-card__name">{ card.name }</span>
				<span className="stored-card__expiration-date">{ this.translate( 'Expires %(date)s', {
					args: { date: expirationDate },
					context: 'date is of the form MM/YY'
				} ) }</span>
			</div>
		);
	}
} );
