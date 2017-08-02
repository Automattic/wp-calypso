/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

class OrderCreated extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			date_created_gmt: PropTypes.string.isRequired,
		} ),
	}

	render() {
		const { moment, order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const createdMoment = moment( order.date_created_gmt + 'Z' );
		const createdLabel = translate(
			'Order created on %(createdDate)s at %(createdTime)s',
			{
				args: {
					createdDate: createdMoment.format( 'll' ),
					createdTime: createdMoment.format( 'LT' ),
				}
			}
		);

		return (
			<div className="order__details-created">
				<div className="order__details-created-label">
					<Gridicon icon="time" size={ 24 } />
					{ createdLabel }
				</div>
			</div>
		);
	}
}

export default localize( OrderCreated );
