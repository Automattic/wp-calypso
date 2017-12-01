/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import Card from 'components/card';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import SectionHeader from 'components/section-header';
import analytics from 'lib/analytics';
import cartValues from 'lib/cart-values';

export class PaymentBox extends PureComponent {
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
			case 'ideal':
				return 'iDEAL';
			case 'giropay':
				return 'Giropay';
			case 'bancontact':
				return 'Bancontact';
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
					<div className="checkout__provider">
						<img
							src="/calypso/images/upgrades/paypal.svg"
							alt="PayPal"
							className="checkout__paypal"
						/>
					</div>
				);
			case 'credit-card':
				return (
					<div className="checkout__provider">
						<Gridicon icon="credit-card" className="checkout__credit-card" />
						{ this.getPaymentProviderName( method ) }
					</div>
				);
			case 'ideal':
				return (
					<div className="checkout__provider">
						<img src="/calypso/images/upgrades/ideal.svg" alt="iDEAL" className="checkout__ideal" />
						{ this.getPaymentProviderName( method ) }
					</div>
				);
			case 'giropay':
				return (
					<div className="checkout__provider">
						<img
							src="/calypso/images/upgrades/giropay.svg"
							alt="Giropay"
							className="checkout__giropay"
						/>
					</div>
				);
			case 'bancontact':
				return (
					<div className="checkout__provider">
						<img
							src="/calypso/images/upgrades/bancontact.svg"
							alt="Bancontact"
							className="checkout__bancontact"
						/>
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
			contentClass = classNames( 'payment-box__content', this.props.contentClassSet );

		const titleText = this.props.currentPaymentMethod
			? translate( 'Pay with %(paymentMethod)s', {
					args: {
						paymentMethod: this.getPaymentProviderName( this.props.currentPaymentMethod ),
					},
				} )
			: translate( 'Loading…' );

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
