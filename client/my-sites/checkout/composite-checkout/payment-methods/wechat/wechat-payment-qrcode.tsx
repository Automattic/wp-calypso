import { Spinner } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
// For some reason, the missing types for qrcode.react are a TS error and not
// just a warning so we must disable the error to pass compilation.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: There are no type definitions for qrcode.react.
import QRCode from 'qrcode.react';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryOrderTransaction from 'calypso/components/data/query-order-transaction';
import { errorNotice } from 'calypso/state/notices/actions';
import { SUCCESS, ERROR, UNKNOWN, FAILURE } from 'calypso/state/order-transactions/constants';
import getOrderTransaction from 'calypso/state/selectors/get-order-transaction';
import getOrderTransactionError from 'calypso/state/selectors/get-order-transaction-error';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { LocalizeProps } from 'i18n-calypso';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface WeChatQRProps {
	className?: string;
	orderId: number;
	redirectUrl: string;
	cart: ResponseCart;
	slug?: string;
	reset: () => void;
	transactionError?: boolean;
	transactionStatus?: string;
	transactionReceiptId?: number;
	showErrorNotice: typeof errorNotice;
	translate: LocalizeProps[ 'translate' ];
}

export class WeChatPaymentQRcode extends Component< WeChatQRProps > {
	componentDidUpdate() {
		const {
			slug,
			transactionError,
			transactionStatus,
			transactionReceiptId,
			showErrorNotice,
			reset,
		} = this.props;

		// HTTP errors + Transaction errors
		if ( transactionError || transactionStatus === ERROR || transactionStatus === UNKNOWN ) {
			reset();

			showErrorNotice(
				this.props.translate( "Sorry, we couldn't process your payment. Please try again later." ),
				{
					displayOnNextPage: true,
				}
			);

			page( slug ? `/checkout/${ slug }` : '/plans' );
		} else if ( transactionStatus === FAILURE ) {
			reset();

			showErrorNotice(
				this.props.translate( 'Payment failed. Please check your account and try again.' ),
				{
					displayOnNextPage: true,
				}
			);

			page( slug ? `/checkout/${ slug }` : '/plans' );
		} else if ( transactionStatus === SUCCESS ) {
			reset();

			if ( transactionReceiptId ) {
				page(
					slug
						? `/checkout/thank-you/${ slug }/${ transactionReceiptId }`
						: '/checkout/thank-you/no-site' // no-site + receiptId errors
				);
			} else {
				page( slug ? `/checkout/thank-you/${ slug }` : '/checkout/thank-you/no-site' );
			}
		}
	}

	render() {
		return (
			<div className={ this.props.className }>
				<QueryOrderTransaction orderId={ this.props.orderId } pollIntervalMs={ 2000 } />

				<p className="checkout__wechat-qrcode-instruction">
					{ this.props.translate(
						'Please scan the barcode using the WeChat Pay application to confirm your %(price)s payment.',
						{
							args: { price: this.props.cart.total_cost_display },
							comment: 'Instruction to scan a QR barcode and finalize payment with WeChat Pay.',
						}
					) }
				</p>

				<div
					className="checkout__wechat-qrcode"
					data-testid="wechat-qrcode"
					data-redirect-url={ this.props.redirectUrl }
				>
					<QRCode value={ this.props.redirectUrl } />
				</div>

				<Spinner className="checkout__wechat-qrcode-spinner" size={ 30 } />

				<p className="checkout__wechat-qrcode-redirect supporting-text">
					{ this.props.translate(
						'On mobile? To open and pay with the WeChat Pay app directly, {{a}}click here{{/a}}.',
						{
							components: { a: <a href={ this.props.redirectUrl } /> },
							comment:
								'Asking if mobile detection has failed and they would like to open and be redirected directly into the WeChat app in order to pay.',
						}
					) }
				</p>
			</div>
		);
	}
}

export default connect(
	(
		storeState,
		ownProps: Omit<
			WeChatQRProps,
			| 'showErrorNotice'
			| 'transactionReceiptId'
			| 'transactionStatus'
			| 'transactionError'
			| 'translate'
		>
	) => {
		const transaction = getOrderTransaction( storeState, ownProps.orderId );
		const transactionError = getOrderTransactionError( storeState, ownProps.orderId );

		return {
			transactionReceiptId:
				transaction?.processingStatus === SUCCESS ? transaction?.receiptId : undefined,
			transactionStatus: transaction?.processingStatus,
			transactionError: !! transactionError,
		};
	},
	{
		showErrorNotice: errorNotice,
	}
)( localize( WeChatPaymentQRcode ) );
