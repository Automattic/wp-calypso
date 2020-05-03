/**
 * External dependencies
 */
import { isEmpty, get, overSome, some } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import CartToggle from './cart-toggle';
import PaymentChatButton from './payment-chat-button';
import SubscriptionText from './subscription-text';
import WeChatPaymentQRcode from './wechat-payment-qrcode';
import { paymentMethodClassName, getLocationOrigin } from 'lib/cart-values';
import userAgent from 'lib/user-agent';
import { Input } from 'my-sites/domains/components/form';
import { convertToSnakeCase } from 'state/data-layer/utils';
import { getHttpData, requestHttpData, httpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import { infoNotice, errorNotice } from 'state/notices/actions';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'lib/plans';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { Button } from '@automattic/components';
import RecentRenewals from './recent-renewals';
import DomainRegistrationRefundPolicy from './domain-registration-refund-policy';
import DomainRegistrationAgreement from './domain-registration-agreement';
import CheckoutTerms from './checkout-terms';

export class WechatPaymentBox extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
		redirectTo: PropTypes.func.isRequired, // on success
		selectedSite: PropTypes.object,
		createRedirect: PropTypes.func,
		showErrorNotice: PropTypes.func,
		showInfoNotice: PropTypes.func,
		pending: PropTypes.bool,
		failure: PropTypes.bool,
		reset: PropTypes.func,
		redirectUrl: PropTypes.string,
		orderId: PropTypes.number,
		isMobile: PropTypes.bool,
	};

	state = { name: '', errorMessage: '' };

	componentWillUnmount() {
		this.props.reset();
	}

	handleSubmit = ( event ) => {
		event.preventDefault();

		const { showInfoNotice, translate, createRedirect } = this.props;

		if ( isEmpty( this.state.name ) || this.state.name.length < 3 ) {
			return this.setState( {
				errorMessage: translate( 'Your Name must contain at least 3 characters' ),
			} );
		}

		showInfoNotice( translate( 'Setting up your WeChat Pay payment' ) );

		createRedirect( this.state.name );
	};

	handleChange = ( event ) => this.setState( { name: event.target.value, errorMessage: '' } );

	componentDidUpdate( prevProps ) {
		const {
			reset,
			cart,
			redirectUrl,
			failure,
			showErrorNotice,
			showInfoNotice,
			translate,
			isMobile,
		} = this.props;

		// Reset transaction if cart is modified
		if (
			prevProps.cart.total_cost !== cart.total_cost ||
			prevProps.cart.products.length !== cart.products.length
		) {
			reset();
		}

		if ( prevProps.pending && failure ) {
			showErrorNotice( translate( "We've encountered a problem. Please try again later." ) );
			reset();
		}

		// The WeChat payment type should only redirect when on mobile as redirect urls
		// are mobile app urls: e.g. weixin://wxpay/bizpayurl?pr=RaXzhu4
		if ( isMobile && redirectUrl ) {
			showInfoNotice(
				translate( "We're redirecting you to the WeChat Pay mobile app to finalize payment." )
			);

			return window.location.assign( redirectUrl );
		}

		if ( prevProps.pending && redirectUrl && ! isMobile ) {
			// Display on desktop
			showInfoNotice( translate( 'Please scan the WeChat Payment barcode.' ) );
		}
	}

	render() {
		const {
			redirectUrl,
			orderId,
			selectedSite,
			presaleChatAvailable,
			cart,
			paymentType,
			children,
			pending,
			translate,
			reset,
			isMobile,
		} = this.props;

		// Only show if chat is available and we have a business/ecommerce plan in the cart.
		const showPaymentChatButton =
			presaleChatAvailable &&
			some( cart.products, ( { product_slug } ) =>
				overSome( isWpComBusinessPlan, isWpComEcommercePlan )( product_slug )
			);

		// Wechat qr codes get set on desktop instead of redirecting
		if ( redirectUrl && ! isMobile ) {
			return (
				<WeChatPaymentQRcode
					orderId={ orderId }
					cart={ cart }
					redirectUrl={ redirectUrl }
					slug={ selectedSite.slug }
					reset={ reset }
				/>
			);
		}

		const formClasses = classNames( { loading: pending } );

		return (
			<React.Fragment>
				<form onSubmit={ this.handleSubmit } className={ formClasses }>
					<div className="checkout__payment-box-sections">
						<div className="checkout__payment-box-section">
							<Input
								additionalClasses="checkout__checkout-field"
								label={ translate( 'Your Name' ) }
								isError={ ! isEmpty( this.state.errorMessage ) }
								errorMessage={ this.state.errorMessage }
								name="name"
								onBlur={ this.handleChange }
								onChange={ this.handleChange }
								value={ this.state.name }
							/>
						</div>
					</div>

					{ children }

					<RecentRenewals cart={ cart } />

					<CheckoutTerms cart={ cart } />

					<DomainRegistrationRefundPolicy cart={ cart } />
					<DomainRegistrationAgreement cart={ this.props.cart } />

					<div className="checkout__payment-box-actions">
						<div className="checkout__payment-buttons  payment-box__payment-buttons">
							<span className="checkout__payment-button pay-button">
								<Button
									type="submit"
									className="checkout__payment-button-button button is-primary button-pay pay-button__button"
									busy={ this.props.pending }
									disabled={ this.props.pending || this.props.failure }
								>
									{ translate( 'Pay %(price)s with WeChat Pay', {
										args: { price: cart.total_cost_display },
									} ) }
								</Button>
								<SubscriptionText cart={ cart } />
							</span>
							<div className="checkout__secure-payment">
								<div className="checkout__secure-payment-content">
									<Gridicon icon="lock" />
									{ translate( 'Secure Payment' ) }
								</div>
							</div>
							{ showPaymentChatButton && (
								<PaymentChatButton paymentType={ paymentType } cart={ cart } />
							) }
						</div>
					</div>
				</form>

				<CartCoupon cart={ cart } />

				<CartToggle />
			</React.Fragment>
		);
	}
}

export const requestId = ( cart ) => `wechat-payment-box/${ get( cart, 'cart_key', '0' ) }`;

export const requestRedirect = ( cart, domain_details, payment ) => {
	return requestHttpData(
		requestId( cart ),
		http( {
			path: '/me/transactions',
			apiVersion: '1.1',
			method: 'POST',
			body: {
				cart,
				domain_details,
				payment,
			},
		} ),
		{
			fromApi: () => ( { order_id, redirect_url } ) => [
				[ requestId( cart ), { orderId: order_id, redirectUrl: redirect_url } ],
			],
			freshness: -Infinity,
		}
	);
};

export default connect(
	( state, { cart } ) => {
		const redirect = getHttpData( requestId( cart ) ) || {};

		return {
			redirectUrl: get( redirect, 'data.redirectUrl', null ),
			orderId: get( redirect, 'data.orderId', null ),
			pending: 'pending' === redirect.state,
			failure: 'failure' === redirect.state,
			isMobile: userAgent.isMobile,
		};
	},
	( dispatch, { cart, transaction, selectedSite, redirectTo } ) => ( {
		createRedirect: ( name ) => {
			const origin = getLocationOrigin( window.location );

			const slug = get( selectedSite, 'slug', 'no-site' );

			const payment = {
				name,
				payment_method: paymentMethodClassName( 'wechat' ),
				success_url: origin + redirectTo(),
				cancel_url: `${ origin }/checkout/${ slug }`,
			};

			dispatch( recordTracksEvent( 'calypso_checkout_with_redirect_wechat' ) );
			dispatch( recordGoogleEvent( 'Upgrades', 'Clicked Checkout With WeChat Payment Button' ) );

			requestRedirect( cart, convertToSnakeCase( transaction.domainDetails ), payment );
		},
		// We should probably extend `update()` in client/state/data-layer/http-data.js
		// to set state back to 'uninitialized'
		reset: () =>
			httpData.set( requestId( cart ), {
				state: 'uninitialized',
				data: {},
				error: undefined,
			} ),
		showErrorNotice: ( error, options ) =>
			dispatch( errorNotice( error, Object.assign( {}, options, { id: 'wechat-payment-box' } ) ) ),
		showInfoNotice: ( info, options ) =>
			dispatch( infoNotice( info, Object.assign( {}, options, { id: 'wechat-payment-box' } ) ) ),
	} )
)( localize( WechatPaymentBox ) );
