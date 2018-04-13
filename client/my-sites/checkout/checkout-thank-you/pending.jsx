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
import QueryOrderTransaction from 'components/data/query-order-transaction';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';

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
		const { translate, showErrorNotice, siteSlug } = this.props;

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

				page(
					receiptId
						? `/checkout/thank-you/${ siteSlug }/${ receiptId }`
						: `/checkout/thank-you/${ siteSlug }`
				);

				return;
			}

			// It is mostly because the user has cancelled the payment.
			// See the explanation in https://github.com/Automattic/wp-calypso/pull/23670#issuecomment-377186515
			if ( ORDER_TRANSACTION_STATUS.FAILURE === processingStatus ) {
				// Bring the user back to the plan page in this case.
				page( planRoute );

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
		const { orderId, translate } = this.props;

		return (
			<Main className="checkout-thank-you__pending">
				<QueryOrderTransaction orderId={ orderId } pollIntervalMs={ 5000 } />
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
