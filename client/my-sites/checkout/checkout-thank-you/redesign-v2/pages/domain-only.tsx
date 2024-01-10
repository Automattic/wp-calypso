import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getDomainPurchaseTypeAndPredicate } from '../../utils';
import ThankYouDomainProduct from '../products/domain-product';
import type ThankYouUpsellMeshColor from 'calypso/components/thank-you-v2/upsell';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

interface DomainOnlyThankYouProps {
	purchases: ReceiptPurchase[];
}

export const getDomainFooterDetails = ( limit?: number ) => {
	const details = [
		{
			key: 'footer-domain-essentials',
			title: translate( 'Dive into domain essentials' ),
			description: translate(
				'Check out our support documentation for step-by-step instructions and expert guidance on your domain set up.'
			),
			buttonText: translate( 'Master the domain basics' ),
			buttonHref: '/support/domains',
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_domain_essentials' );
			},
		},
		{
			key: 'footer-domain-resources',
			title: translate( 'Your go-to domain resource' ),
			description: translate(
				'Dive into our comprehensive support documentation to learn the basics of domains, from registration to management.'
			),
			buttonText: translate( 'Domain support resources' ),
			buttonHref: '/support/category/domains-and-email/',
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_domain_resources' );
			},
		},
	];

	return details.slice( 0, limit ?? details.length );
};

export default function DomainOnlyThankYou( { purchases }: DomainOnlyThankYouProps ) {
	const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );
	const domains = purchases.filter( predicate ).map( ( purchase ) => purchase?.meta );
	const firstDomain = domains[ 0 ];
	const siteSlug = useSelector( getSelectedSiteSlug );

	const upsellProps = {
		title: translate( 'Professional email' ),
		description: translate(
			'85% of people trust an email address with a custom domain name over a generic one.'
		),
		meshColor: 'blue' as ThankYouUpsellMeshColor,
		icon: emailImage,
		action: (
			<Button
				href={ emailManagement( siteSlug ?? firstDomain, firstDomain ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_domain_only_thank_you_professional_email_click' )
				}
			>
				{ translate( 'Add email' ) }
			</Button>
		),
	};

	const products = purchases.filter( predicate ).map( ( purchase ) => {
		const domainNameSlug = purchase.meta.replace( '.', '-' );

		return (
			<ThankYouDomainProduct
				purchase={ purchase }
				key={ `domain-${ domainNameSlug }` }
				siteSlug={ siteSlug }
				shareSite
			/>
		);
	} );

	return (
		<ThankYouV2
			title={ translate( 'Your own corner of the web' ) }
			subtitle={ translate(
				'All set! We’re just setting up your new domain so you can start spreading the word.',
				'All set! We’re just setting up your new domains so you can start spreading the word.',
				{
					count: domains.length,
				}
			) }
			products={ products }
			footerDetails={ getDomainFooterDetails() }
			upsellProps={ upsellProps }
		/>
	);
}
