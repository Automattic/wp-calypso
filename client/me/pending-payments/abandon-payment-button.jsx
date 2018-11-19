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
import Button from 'components/button';
import { errorNotice, infoNotice } from 'state/notices/actions';

// tofix: how to ensure pending payment list updates after payment is abandoned. (http shove-it data woes?) (flip to redux actions?)
export class AbandonPaymentButton extends Component {
	onAbandonPayment = () => {
		const { orderId, showInfoNotice, translate } = this.props;

		//clearPendingPayment( orderId );

		// tmp
		showInfoNotice( orderId + ' ' + translate( 'Payment abandoned.' ) );
	};

	render = () => {
		const { translate } = this.props;

		return (
			<Button primary={ false } onClick={ this.onAbandonPayment }>
				<Gridicon icon="trash" />
				{ translate( 'Abandon Payment' ) }
			</Button>
		);
	};
}

AbandonPaymentButton.propTypes = {
	orderId: PropTypes.number.isRequired,
};

export default connect(
	() => ( {} ),
	dispatch => ( {
		clearPendingPayment: () => {},
		showInfoNotice: ( info, options ) =>
			dispatch( infoNotice( info, Object.assign( {}, options, { id: 'pending-payments-item' } ) ) ),
		showErrorNotice: ( error, options ) =>
			dispatch(
				errorNotice( error, Object.assign( {}, options, { id: 'pending-payments-item' } ) )
			),
	} )
)( localize( AbandonPaymentButton ) );
