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
		error: PropTypes.object,
		errorNotice: PropTypes.func,
		localize: PropTypes.func,
	};

	static defaultProps = {
		localize: identity,
		errorNotice: identity,
	};

	componentWillReceiveProps( nextProps ) {
		const { transaction, error } = nextProps;
		const { translate, showErrorNotice } = this.props;

		const retryOnError = () => {
			page( `/checkout/${ this.props.siteSlug }` );

			showErrorNotice(
				translate( "Sorry, we couldn't process your payment. Please try again later." )
			);
		};

		if ( transaction ) {
			const { processingStatus } = transaction;

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

			// or the processing status indicates that there was something wrong.
			if ( ORDER_TRANSACTION_STATUS.ERROR === processingStatus ) {
				// redirect users back to the checkout page so they can try again.
				retryOnError();

				return;
			}

			// The API has responded a status string that we don't expect somehow.
			if ( ORDER_TRANSACTION_STATUS.UNKNOWN === processingStatus ) {
				// Redirect users back to the homepage so that they won't be stuck here.
				page( '/' );

				showErrorNotice( translate( 'Oops! Something went wrong. Please try again later.' ) );

				return;
			}
		}

		// A HTTP error occurs. We use the same handling
		if ( error ) {
			retryOnError();
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

export default connect(
	( state, props ) => ( {
		transaction: getOrderTransaction( state, props.orderId ),
		error: getOrderTransactionError( state, props.orderId ),
	} ),
	{
		showErrorNotice: errorNotice,
	}
)( localize( CheckoutPending ) );
