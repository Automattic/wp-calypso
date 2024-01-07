import {
	isDomainTransfer,
	isDomainMapping,
	isDomainRegistration,
} from '@automattic/calypso-products';
import { Button, ClipboardButton } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import { domainManagementList, domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ThankYouLayout from '../redesign-v2/ThankYouLayout';

interface DomainOnlyThankYouContainerProps {
	purchases: ReceiptPurchase[];
}

const DomainOnlyThankYou: React.FC< DomainOnlyThankYouContainerProps > = ( { purchases } ) => {
	const getDomainPurchaseType = ( purchases: ReceiptPurchase[] ) => {
		const hasDomainMapping = purchases.some( isDomainMapping );

		if ( hasDomainMapping && purchases.some( isDomainRegistration ) ) {
			return [ 'REGISTRATION', isDomainRegistration ];
		} else if ( hasDomainMapping ) {
			return [ 'MAPPING', isDomainMapping ];
		}
		return [ 'TRANSFER', isDomainTransfer ];
	};

	const [ , predicate ] = getDomainPurchaseType( purchases );
	const domains = purchases.filter( predicate ).map( ( purchase ) => purchase?.meta );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const firstDomain = domains[ 0 ];

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

	const purchaseDetailsProps = [
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

	const shareSite = true;
	const [ isCopying, setIsCopying ] = useState( false );
	const handleShareSite = ( processing: boolean ) => () => {
		setIsCopying( processing );
	};

	const productsProps = domains.map( ( domain ) => {
		return {
			name: domain,
			key: 'domain-' + domain,
			actions: (
				<>
					{ shareSite && (
						<ClipboardButton
							// @ts-expect-error The button props are passed into a Button component internally, but the types don't account that.
							variant="primary"
							onCopy={ handleShareSite( true ) }
							onFinishCopy={ handleShareSite( false ) }
							text={ domain }
						>
							{ isCopying ? translate( 'Site copied' ) : translate( 'Share site' ) }
						</ClipboardButton>
					) }
					<Button
						variant={ shareSite ? 'secondary' : 'primary' }
						href={ siteSlug ? domainManagementList( siteSlug ) : domainManagementRoot() }
					>
						{ translate( 'Manage domains' ) }
					</Button>
				</>
			),
		};
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
			productsProps={ productsProps }
			purchaseDetailsProps={ purchaseDetailsProps }
			upsellProps={ upsellProps }
		/>
	);
};

export default DomainOnlyThankYou;
