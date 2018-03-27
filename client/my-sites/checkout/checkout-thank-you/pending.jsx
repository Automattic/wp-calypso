/** @format */

/**
 * External dependencies
 */
import page from 'page';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getSourcePaymentTransactionDetail } from 'state/selectors';

class CheckoutPending extends PureComponent {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
	};

	componentWillReceiveProps( nextProps ) {
		if ( 'successful' === nextProps.paymentInfo.status ) {
			page( `/checkout/thank-you/${ this.props.siteSlug }` );
			return;
		}

		// redirect users back to the checkout page so they can try again.
		if ( 'failed' === nextProps.paymentInfo.status ) {
			page( `/checkout/${ this.props.siteSlug }` );
			return;
		}
	}

	render() {
		const { orderId } = this.props;

		// TODO:
		// Replace this placeholder by the real one
		return (
			<div>
				<p>Waiting for the payment result of { orderId }</p>
			</div>
		);
	}
}

export default connect( ( state, props ) => ( {
	paymentInfo: getSourcePaymentTransactionDetail( state, props.orderId ),
} ) )( CheckoutPending );
