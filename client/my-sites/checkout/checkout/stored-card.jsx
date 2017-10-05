/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

module.exports = localize(class extends React.Component {
    static displayName = 'StoredCard';

	render() {
		var card = this.props.card,
			expirationDate = this.props.moment( card.expiry ).format( 'MM/YY' ),
			cardClasses = 'stored-card ' + card.card_type.toLowerCase();

		return (
            <div className={ cardClasses }>
				<span className="stored-card__number">{ card.card_type } ****{ card.card }</span>
				<span className="stored-card__name">{ card.name }</span>
				<span className="stored-card__expiration-date">{ this.props.translate( 'Expires %(date)s', {
					args: { date: expirationDate },
					context: 'date is of the form MM/YY'
				} ) }</span>
			</div>
        );
	}
});
