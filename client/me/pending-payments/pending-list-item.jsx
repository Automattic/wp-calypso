/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { errorNotice, infoNotice } from 'state/notices/actions';

export class PendingListItem extends Component {
	onCompletePayment = () => {
		const { showInfoNotice, translate } = this.props;

		showInfoNotice( translate( 'Payment complete.' ) );
	};

	onAbandonPayment = () => {
		const { showInfoNotice, translate } = this.props;

		showInfoNotice( translate( 'Payment abandoned.' ) );
	};

	render = () => {
		const { productName, paymentType, totalCostDisplay, translate } = this.props;

		return (
			<Card className={ 'pending-payments__list-item' }>
				<span className="pending-payments__list-item-wrapper">
					<div className="pending-payments__list-item-details">
						<div className="pending-payments__list-item-title">{ productName }</div>
						<div className="pending-payments__list-item-purchase-type">{ paymentType }</div>
						<div className="pending-payments__list-item-purchase-date">{ totalCostDisplay }</div>
						<div className="pending-payments__list-item-actions">
							<Button primary={ false } href="/help/contact">
								<Gridicon icon="help" />
								<span>{ translate( 'Contact Support' ) }</span>
							</Button>
							<Button primary={ false } onClick={ this.onAbandonPayment }>
								<Gridicon icon="trash" />
								{ translate( 'Abandon Payment' ) }
							</Button>
							<Button primary={ true } onClick={ this.onCompletePayment }>
								{ translate( 'Complete Payment' ) }
							</Button>
						</div>
					</div>
				</span>
			</Card>
		);
	};
}

PendingListItem.propTypes = {
	productName: PropTypes.string.isRequired,
	paymentType: PropTypes.string.isRequired,
	totalCostDisplay: PropTypes.string.isRequired,
};

export default connect(
	() => ( {} ),
	dispatch => ( {
		showInfoNotice: ( info, options ) =>
			dispatch( infoNotice( info, Object.assign( {}, options, { id: 'pending-payments-item' } ) ) ),
		showErrorNotice: ( error, options ) =>
			dispatch(
				errorNotice( error, Object.assign( {}, options, { id: 'pending-payments-item' } ) )
			),
	} )
)( localize( PendingListItem ) );
