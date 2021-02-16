/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import EmailProviderDetails from 'calypso/my-sites/email/email-providers-comparison/email-provider-details';
import { getAnnualPrice, getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import gSuiteLogo from 'calypso/assets/images/email-providers/gsuite.svg';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';

export default function GSuiteProviderDetails( {
	className,
	currencyCode,
	gSuiteProduct,
	onAddGSuiteClick,
} ) {
	const translate = useTranslate();
	let title = translate( 'G Suite by Google' );
	let description = translate(
		"We've partnered with Google to offer you email, storage, docs, calendars, and more."
	);
	let logo = gSuiteLogo;
	let buttonLabel = translate( 'Add G Suite' );

	if ( config.isEnabled( 'google-workspace-migration' ) ) {
		title = getGoogleMailServiceFamily();
		description = translate(
			'The best way to create, communicate, and collaborate. An integrated workspace that is simple and easy to use.'
		);
		logo = googleWorkspaceIcon;
		buttonLabel = translate( 'Add %(googleMailService)s', {
			args: {
				googleMailService: getGoogleMailServiceFamily(),
			},
			comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
		} );
	}

	return (
		<EmailProviderDetails
			title={ title }
			description={ description }
			image={ { path: logo } }
			features={ [
				translate( 'Annual billing' ),
				translate( 'Send and receive from your custom domain' ),
				translate( '30GB storage' ),
				translate( 'Email, calendars, and contacts' ),
				translate( 'Video calls, docs, spreadsheets, and more' ),
				translate( 'Work from anywhere on any device – even offline' ),
			] }
			formattedPrice={ translate( '{{price/}} /user /year', {
				components: {
					price: <span>{ getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode ) }</span>,
				},
				comment: '{{price/}} is the formatted price, e.g. $20',
			} ) }
			discount={
				hasDiscount( gSuiteProduct )
					? translate( 'First year %(discountedPrice)s', {
							args: {
								discountedPrice: getAnnualPrice( gSuiteProduct.sale_cost, currencyCode ),
							},
							comment: '%(discountedPrice)s is a formatted price, e.g. $75',
					  } )
					: null
			}
			buttonLabel={ buttonLabel }
			onButtonClick={ onAddGSuiteClick }
			className={ classNames( className, 'gsuite' ) }
		/>
	);
}
