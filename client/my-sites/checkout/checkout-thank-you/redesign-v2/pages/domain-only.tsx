import {
	isDomainTransfer,
	isDomainMapping,
	isDomainRegistration,
} from '@automattic/calypso-products';
import { Button, ClipboardButton } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import ThankYouLayout from 'calypso/components/thank-you-v2';
import { domainManagementList, domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import ProductDomain from '../products/product-domain';
import { getDomainPurchaseType } from '../../utils';

interface DomainOnlyThankYouContainerProps {
	purchases: ReceiptPurchase[];
}

export const getDomainPurchaseDetails = ( limit: number ) => {
	const details = [
		{
			key: 'domain-essentials',
			title: translate( 'Dive into domain essentials' ),
			description: translate(
				'Check out our support documentation for step-by-step instructions and expert guidance on your domain set up.'
			),
			buttonText: translate( 'Master the domain basics' ),
			href: '/support/domains',
			onClick: () =>
				recordTracksEvent( 'calypso_domain_transfer_to_any_user_support_domains_click' ),
		},
		{
			key: 'domain-resources',
			title: translate( 'Your go-to domain resource' ),
			description: translate(
				'Dive into our comprehensive support documentation to learn the basics of domains, from registration to management.'
			),
			buttonText: translate( 'Domain support resources' ),
			href: '/support/domains',
			onClick: () =>
				recordTracksEvent( 'calypso_domain_transfer_to_any_user_support_domains_click' ),
		},
	];

	return details.slice( 0, limit ?? details.length );
};

export const DomainOnlyThankYou: React.FC< DomainOnlyThankYouContainerProps > = ( { purchases } ) => {
	const [ , predicate ] = getDomainPurchaseType( purchases );
	const domains = purchases.filter( predicate ).map( ( purchase ) => purchase?.meta );
	const firstDomain = domains[ 0 ];
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );

	const upsellProps = {
		title: translate( 'Professional email' ),
		description: translate(
			'85% of people trust an email address with a custom domain name over a generic one.'
		),
		meshColor: 'blue',
		icon: emailImage,
		href: emailManagement( siteSlug ?? firstDomain, firstDomain ),
		buttonText: translate( 'Add email' ),
		trackEvent: 'calypso_domain_only_thank_you_professional_email_click',
	};

	const products = purchases.filter( predicate ).filter( predicate ).map( ( purchase, index ) => {
		return ( <ProductDomain purchase={ purchase } key={ index } siteSlug={ siteSlug } /> );
	} );

	return (
		<ThankYouLayout
			title={ translate( 'Your own corner of the web' ) }
			subtitle={ translate(
				'All set! We’re just setting up your new domain so you can start spreading the word.',
				'All set! We’re just setting up your new domains so you can start spreading the word.',
				{
					count: domains.length,
				}
			) }
			products={ products }
			purchaseDetailsProps={ getDomainPurchaseDetails() }
			upsellProps={ upsellProps }
			masterbarProps={ {
				siteSlug,
				siteId,
				backText: siteSlug ? translate( 'Back to home' ) : undefined,
			} }
		/>
	);
};
