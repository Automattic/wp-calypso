/** @format */

/**
 * External dependencies
 */
import page from 'page';
import { localize } from 'i18n-calypso';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { getOrderTransaction, getOrderTransactionError } from 'state/selectors';
import { ORDER_TRANSACTION_STATUS } from 'state/order-transactions/constants';
import { errorNotice } from 'state/notices/actions';

class CheckoutPending extends PureComponent {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		transaction: PropTypes.object,
		localize: PropTypes.func,
	};

	static defaultProps = {
		localize: identity,
	};

	componentWillReceiveProps( nextProps ) {
		const { transaction: processingStatus, translate, error } = nextProps;

		if ( ORDER_TRANSACTION_STATUS.SUCCESS === processingStatus ) {
			page( `/checkout/thank-you/${ this.props.siteSlug }` );
			return;
		}

		// It is mostly because the user has cancelled the payment.
		// See the explanation in https://github.com/Automattic/wp-calypso/pull/23670#issuecomment-377186515
		if ( ORDER_TRANSACTION_STATUS.FAILURE === processingStatus ) {
			// Bring the user back to the homepage in this case.
			page( '/' );
			return;
		}

		// It could be a HTTP error or the processing status indicates that there was something wrong.
		if ( error !== null || ORDER_TRANSACTION_STATUS.ERROR === processingStatus ) {
			errorNotice(
				translate( 'We have problems fetching your payment status. Please try again later.' )
			);

			// redirect users back to the checkout page so they can try again.
			page( `/checkout/${ this.props.siteSlug }` );
			return;
		}

		// The API has responded a status string that we don't expect somehow.
		if ( ORDER_TRANSACTION_STATUS.UNKNOWN === processingStatus ) {
			errorNotice( translate( "We've encountered unknown. Please try again later." ) );

			// Redirect users back to the homepage so that they won't be stuck here.
			page( '/' );
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
	transaction: getOrderTransaction( state, props.orderId ),
	transactionError: getOrderTransactionError( state, props.orderId ),
} ) )( localize( CheckoutPending ) );
