import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.jpg';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { ThankYouUpsellProps } from 'calypso/components/thank-you-v2/upsell';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getProfessionalEmailCheckoutUpsellPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getDomainPurchaseTypeAndPredicate } from '../../utils';
import ThankYouDomainProduct from '../products/domain-product';
import getDomainFooterDetails from './content/get-domain-footer-details';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

interface DomainOnlyThankYouProps {
	purchases: ReceiptPurchase[];
	receiptId: number;
}

export default function DomainOnlyThankYou( { purchases, receiptId }: DomainOnlyThankYouProps ) {
	const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );
	const domains = purchases.filter( predicate ).map( ( purchase ) => purchase?.meta );
	const firstDomainName = domains[ 0 ];
	const siteSlug = useSelector( getSelectedSiteSlug );

	const upsellProps: ThankYouUpsellProps = {
		title: translate( 'Professional email' ),
		description: (
			<>
				{ translate( 'Establish credibility and build trust by using a custom email address.' ) }
				<br />
				{ translate(
					'Studies show that 85% of people trust custom domain email addresses more than generic ones.'
				) }
			</>
		),
		image: emailImage,
		action: (
			<Button
				href={ getProfessionalEmailCheckoutUpsellPath( siteSlug, firstDomainName, receiptId ) }
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
