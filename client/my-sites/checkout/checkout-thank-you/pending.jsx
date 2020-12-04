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
import getOrderTransaction from 'calypso/state/selectors/get-order-transaction';

import getOrderTransactionError from 'calypso/state/selectors/get-order-transaction-error';
import { ORDER_TRANSACTION_STATUS } from 'calypso/state/order-transactions/constants';
import { errorNotice } from 'calypso/state/notices/actions';
import QueryOrderTransaction from 'calypso/components/data/query-order-transaction';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

class CheckoutPending extends PureComponent {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		transaction: PropTypes.object,
		error: PropTypes.object,
		errorNotice: PropTypes.func,
		localize: PropTypes.func,
		redirectTo: PropTypes.string,
	};

	static defaultProps = {
		localize: identity,
		errorNotice: identity,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { transaction, error } = nextProps;
		const { translate, showErrorNotice, siteSlug } = this.props;
		const redirectTo = this.props.redirectTo || `/checkout/thank-you/${ siteSlug }/pending`;

		const retryOnError = () => {
			page( `/checkout/${ siteSlug }` );

			showErrorNotice(
				translate( "Sorry, we couldn't process your payment. Please try again later." )
			);
		};

		const planRoute = `/plans/my-plan/${ siteSlug }`;

		if ( transaction ) {
			const { processingStatus } = transaction;

			if ( ORDER_TRANSACTION_STATUS.SUCCESS === processingStatus ) {
				const { receiptId } = transaction;

				const redirectPath = redirectTo.replace( 'pending', receiptId );
				page( redirectPath );

				return;
			}

			if ( ORDER_TRANSACTION_STATUS.ASYNC_PENDING === transaction.processingStatus ) {
				page( '/me/purchases/pending' );

				return;
			}

			// If the processing status indicates that there was something wrong.
			// It could be because the user has cancelled the payment, or because the payment failed after being authorized
			if (
				ORDER_TRANSACTION_STATUS.ERROR === processingStatus ||
				ORDER_TRANSACTION_STATUS.FAILURE === processingStatus
			) {
				// redirect users back to the checkout page so they can try again.
				retryOnError();

				return;
			}

			// The API has responded a status string that we don't expect somehow.
			if ( ORDER_TRANSACTION_STATUS.UNKNOWN === processingStatus ) {
				// Redirect users back to the plan page so that they won't be stuck here.
				page( planRoute );

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
		const { orderId, siteSlug, translate } = this.props;

		return (
			<Main className="checkout-thank-you__pending">
				<QueryOrderTransaction orderId={ orderId } pollIntervalMs={ 5000 } />
				<PageViewTracker
					path={
						siteSlug
							? '/checkout/thank-you/:site/pending/:order_id'
							: '/checkout/thank-you/no-site/pending/:order_id'
					}
					title="Checkout Pending"
					properties={ { order_id: orderId, ...( siteSlug && { site: siteSlug } ) } }
				/>
				<EmptyContent
					illustration={ '/calypso/images/illustrations/illustration-shopping-bags.svg' }
					illustrationWidth={ 500 }
					title={ translate( 'Processing…' ) }
					line={ translate( "Almost there – we're currently finalizing your order." ) }
				/>
			</Main>
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
