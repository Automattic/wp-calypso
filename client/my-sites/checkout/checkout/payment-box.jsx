/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { snakeCase, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Card from 'components/card';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import SectionHeader from 'components/section-header';
import analytics from 'lib/analytics';
import cartValues, { paymentMethodName } from 'lib/cart-values';
import {
	detectWebPaymentMethod,
	getWebPaymentMethodName,
	WEB_PAYMENT_BASIC_CARD_METHOD,
	WEB_PAYMENT_APPLE_PAY_METHOD,
} from './web-payment-box';

export class PaymentBox extends PureComponent {
	constructor() {
		super();
		this.handlePaymentMethodChange = this.handlePaymentMethodChange.bind( this );
	}

	componentDidUpdate() {
		// If the current payment method is no longer in the available methods list, switch to the first one available.
		// Useful when some methods may be dropped based on payment option, like subscription length.
		if (
			this.props.paymentMethods &&
			! includes( this.props.paymentMethods, this.props.currentPaymentMethod )
		) {
			this.props.onSelectPaymentMethod( this.props.paymentMethods[ 0 ] );
		}
	}

	handlePaymentMethodChange( paymentMethod ) {
		const onSelectPaymentMethod = this.props.onSelectPaymentMethod;
		return function() {
			analytics.ga.recordEvent( 'Upgrades', 'Switch Payment Method' );
			analytics.tracks.recordEvent( 'calypso_checkout_switch_to_' + snakeCase( paymentMethod ) );
			onSelectPaymentMethod( paymentMethod );
		};
	}

	getPaymentProviderLabel( method ) {
		let labelLogo = (
			<img
				src={ `/calypso/images/upgrades/${ method }.svg` }
				alt={ paymentMethodName( method ) }
				className={ `checkout__${ method }` }
			/>
		);

		let labelAdditionalText = '';

		switch ( method ) {
			case 'credit-card':
				labelLogo = <Gridicon icon="credit-card" className="checkout__credit-card" />;
				labelAdditionalText = paymentMethodName( method );
				break;
			case 'emergent-paywall':
				const paytmLogo = (
					<img
						src="/calypso/images/upgrades/paytm.svg"
						alt="paytm"
						className="checkout__paytm"
						key="paytm"
					/>
				);

				labelLogo = (
					<span className="checkout__emergent-paywall">
						{ paytmLogo } / Net banking / Debit card
					</span>
				);
				break;
			case 'ideal':
			case 'brazil-tef':
			case 'wechat':
				labelAdditionalText = paymentMethodName( method );
				break;

			case 'web-payment':
				const webPaymentMethod = detectWebPaymentMethod();

				switch ( webPaymentMethod ) {
					case WEB_PAYMENT_BASIC_CARD_METHOD:
						labelLogo = <Gridicon icon="folder" />;
						break;

					case WEB_PAYMENT_APPLE_PAY_METHOD:
						labelLogo = (
							<img
								src={ `/calypso/images/upgrades/apple.svg` }
								alt="🍎"
								className="checkout__apple-pay"
							/>
						);
						break;
				}

				labelAdditionalText = getWebPaymentMethodName( webPaymentMethod, this.props.translate );
				break;
		}

		return (
			<div className="checkout__provider">
				{ labelLogo }
				{ labelAdditionalText }
			</div>
		);
	}

	paymentMethod( method ) {
		if ( ! cartValues.isPaymentMethodEnabled( this.props.cart, method ) ) {
			return null;
		}

		if ( 'web-payment' === method && null === detectWebPaymentMethod() ) {
			return null;
		}

		return (
			<NavItem
				key={ method }
				className={ method }
				href=""
				onClick={ this.handlePaymentMethodChange( method ) }
				selected={ this.props.currentPaymentMethod === method }
			>
				{ this.getPaymentProviderLabel( method ) }
			</NavItem>
		);
	}

	getPaymentMethods() {
		if ( ! this.props.paymentMethods ) {
			return null;
		}
		return this.props.paymentMethods.map( method => {
			return this.paymentMethod( method );
		} );
	}

	render() {
		const cardClass = classNames( 'payment-box', this.props.classSet ),
			contentClass = classNames( 'payment-box__content', this.props.contentClassSet );

		const titleText = this.props.currentPaymentMethod
			? this.props.translate( 'Pay with %(paymentMethod)s', {
					args: {
						paymentMethod: paymentMethodName( this.props.currentPaymentMethod ),
					},
			  } )
			: this.props.translate( 'Loading…' );

		const paymentMethods = this.getPaymentMethods();

		return (
			<div className="checkout__payment-box-container" key={ this.props.currentPage }>
				{ this.props.title ? <SectionHeader label={ this.props.title } /> : null }

				{ paymentMethods && (
					<SectionNav selectedText={ titleText }>
						<NavTabs>{ paymentMethods }</NavTabs>
					</SectionNav>
				) }

				<Card className={ cardClass }>
					<div className="checkout__box-padding">
						<div className={ contentClass }>{ this.props.children }</div>
					</div>
				</Card>
			</div>
		);
	}
}

PaymentBox.displayName = 'PaymentBox';

export default localize( PaymentBox );
