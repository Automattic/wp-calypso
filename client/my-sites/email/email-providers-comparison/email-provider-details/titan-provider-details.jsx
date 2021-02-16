/**
 * External dependencies
 */
import classNames from 'classnames';
import formatCurrency from '@automattic/format-currency';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getTitanProductName } from 'calypso/lib/titan/get-titan-product-name';
import Gridicon from 'calypso/components/gridicon';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan.svg';
import EmailProviderDetails from './index';

export default function TitanProviderDetails( {
	className,
	currencyCode,
	onAddTitanClick,
	titanMailProduct,
} ) {
	const translate = useTranslate();
	const billingFrequency = translate( 'Monthly billing' );
	const formattedPrice = translate( '{{price/}} /user /month', {
		components: {
			price: <span>{ formatCurrency( titanMailProduct?.cost ?? 0, currencyCode ) }</span>,
		},
		comment: '{{price/}} is the formatted price, e.g. $20',
	} );
	const providerName = getTitanProductName();
	const providerCtaText = translate( 'Add %(emailProductName)s', {
		args: {
			emailProductName: providerName,
		},
		comment: '%(emailProductName)s is the product name, either "Email" or "Titan Mail"',
	} );
	const providerEmailLogo = (
		<Gridicon className="email-provider-details__providers-wordpress-com-email" icon="my-sites" />
	);
	const badge = <img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />;

	return (
		<EmailProviderDetails
			title={ providerName }
			description={ translate(
				'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
			) }
			image={ providerEmailLogo }
			features={ [
				billingFrequency,
				translate( 'Send and receive from your custom domain' ),
				translate( '30GB storage' ),
				translate( 'Email, calendars, and contacts' ),
				translate( 'One-click import of existing emails and contacts' ),
				translate( 'Read receipts to track email opens' ),
			] }
			formattedPrice={ formattedPrice }
			buttonLabel={ providerCtaText }
			hasPrimaryButton={ true }
			onButtonClick={ onAddTitanClick }
			badge={ badge }
			className={ classNames( className, 'titan' ) }
		/>
	);
}
