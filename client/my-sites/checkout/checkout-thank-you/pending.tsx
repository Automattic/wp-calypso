import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryOrderTransaction from 'calypso/components/data/query-order-transaction';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { errorNotice } from 'calypso/state/notices/actions';
import { ORDER_TRANSACTION_STATUS } from 'calypso/state/order-transactions/constants';
import getOrderTransaction from 'calypso/state/selectors/get-order-transaction';
import getOrderTransactionError from 'calypso/state/selectors/get-order-transaction-error';

interface CheckoutPendingProps {
	orderId: number;
	siteSlug: string;
	redirectTo?: string;
}

function CheckoutPending( { orderId, siteSlug, redirectTo }: CheckoutPendingProps ): JSX.Element {
	const translate = useTranslate();
	const transaction = useSelector( ( state ) => getOrderTransaction( state, orderId ) );
	const error = useSelector( ( state ) => getOrderTransactionError( state, orderId ) );
	const reduxDispatch = useDispatch();
	const cartKey = useCartKey();
	const { reloadFromServer: reloadCart } = useShoppingCart( cartKey );
	const didRedirect = useRef( false );

	useEffect( () => {
		if ( didRedirect.current ) {
			return;
		}

		// Make sure the cart is always fresh if anything changes.
		reloadCart();

		const redirectUrl = redirectTo || `/checkout/thank-you/${ siteSlug }/pending`;

		const retryOnError = () => {
			didRedirect.current = true;
			page( `/checkout/${ siteSlug }` );

			reduxDispatch(
				errorNotice(
					translate( "Sorry, we couldn't process your payment. Please try again later." )
				)
			);
		};

		const planRoute = `/plans/my-plan/${ siteSlug }`;

		if ( transaction ) {
			const { processingStatus } = transaction;

			if ( ORDER_TRANSACTION_STATUS.SUCCESS === processingStatus ) {
				const { receiptId } = transaction;

				didRedirect.current = true;
				if ( redirectUrl.startsWith( '/' ) ) {
					const redirectPath = redirectUrl.replace( 'pending', receiptId );
					page( redirectPath );
				} else {
					window.location.href = redirectUrl;
				}

				return;
			}

			if ( ORDER_TRANSACTION_STATUS.ASYNC_PENDING === transaction.processingStatus ) {
				didRedirect.current = true;
				page( '/me/purchases/pending' );
				return;
			}

			// If the processing status indicates that there was something wrong, it
			// could be because the user has cancelled the payment, or because the
			// payment failed after being authorized.
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
				didRedirect.current = true;
				// Redirect users back to the plan page so that they won't be stuck here.
				page( planRoute );

				reduxDispatch(
					errorNotice( translate( 'Oops! Something went wrong. Please try again later.' ) )
				);

				return;
			}
		}

		// A HTTP error occured; we will send the user back to checkout.
		if ( error ) {
			retryOnError();
		}
	}, [ error, redirectTo, reduxDispatch, siteSlug, transaction, translate, reloadCart ] );

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

export default function CheckoutPendingWrapper( props: CheckoutPendingProps ) {
	return (
		<CalypsoShoppingCartProvider>
			<CheckoutPending { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
