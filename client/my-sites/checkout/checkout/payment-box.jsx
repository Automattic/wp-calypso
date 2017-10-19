/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import Card from 'components/card';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import analytics from 'lib/analytics';
import cartValues from 'lib/cart-values';

class PaymentBox extends PureComponent {
	constructor() {
		super();
		this.handlePaymentMethodChange = this.handlePaymentMethodChange.bind( this );
	}

	handlePaymentMethodChange( paymentMethod ) {
		const onSelectPaymentMethod = this.props.onSelectPaymentMethod;
		return function() {
			analytics.ga.recordEvent( 'Upgrades', 'Switch Payment Method' );
			analytics.tracks.recordEvent( 'calypso_checkout_switch_to_' + paymentMethod );
			onSelectPaymentMethod( paymentMethod );
		};
	}

	getPaymentProviderName( method ) {
		switch ( method ) {
			case 'credit-card':
				return translate( 'Credit or debit card' );
			case 'paypal':
				return 'PayPal';
		}

		return method;
	}

	getPaymentProviderLabel( method ) {
		switch ( method ) {
			case 'paypal':
				return (
					<div>
						<img
							src="/calypso/images/upgrades/paypal.svg"
							alt="PayPal"
							className="checkout__paypal"
						/>
					</div>
				);
			case 'credit-card':
				return (
					<div>
						<img
							src="/calypso/images/upgrades/credit-card.svg"
							alt="PayPal"
							className="checkout__credit-card"
						/>
						<span>{ this.getPaymentProviderName( method ) }</span>
					</div>
				);
		}

		return <span>{ this.getPaymentProviderName( method ) }</span>;
	}

	paymentMethod( method ) {
		if ( ! cartValues.isPaymentMethodEnabled( this.props.cart, method ) ) {
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
			contentClass = classNames( 'payment-box__content', this.props.contentClassSet ),
			titleText = this.props.currentPaymentMethod
				? translate( 'Pay with %(paymentMethod)s', {
						args: {
							paymentMethod: this.getPaymentProviderName( this.props.currentPaymentMethod ),
						},
					} )
				: translate( 'Loading…' );

		return (
			<div className="checkout__payment-box-container" key={ this.props.currentPage }>
				<SectionNav selectedText={ titleText }>
					<NavTabs>
						<li className="checkout__payment-box-title">
							{ this.props.paymentMethods ? (
								translate( 'Secure Payment with', {
									comment: 'followed by a graphical list of payment methods.',
								} )
							) : (
								this.props.title
							) }
						</li>
						{ this.getPaymentMethods() }
					</NavTabs>
				</SectionNav>
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
