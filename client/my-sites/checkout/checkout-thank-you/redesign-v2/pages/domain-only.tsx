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
import getDomainFooterDetails from './content/get-domain-footer-details';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

interface DomainOnlyThankYouProps {
	purchases: ReceiptPurchase[];
}

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
		return (
			<ThankYouDomainProduct
				purchase={ purchase }
				key={ `domain-${ purchase.meta }` }
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
