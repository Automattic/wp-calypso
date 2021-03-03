/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';

import { withLocalizedMoment } from 'calypso/components/localized-moment';

class OrderCreated extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			date_created_gmt: PropTypes.string.isRequired,
		} ),
	};

	render() {
		const { moment, order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const createdMoment = moment( order.date_created_gmt + 'Z' );
		const createdLabel = translate( 'Order created on %(createdDate)s at %(createdTime)s', {
			args: {
				createdDate: createdMoment.format( 'll' ),
				createdTime: createdMoment.format( 'LT' ),
			},
		} );

		return (
			<div className="order-created">
				<div className="order-created__label">
					<Gridicon icon="time" size={ 24 } />
					{ createdLabel }
				</div>
			</div>
		);
	}
}

export default localize( withLocalizedMoment( OrderCreated ) );
