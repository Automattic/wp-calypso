import { Button, SelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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

function UpsellActions( { domainNames, receiptId }: { domainNames: string[]; receiptId: number } ) {
	const translate = useTranslate();
	const [ selectedDomainName, setSelectedDomainName ] = useState( domainNames[ 0 ] );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const domainNameOptions = domainNames.map( ( domainName ) => ( {
		label: domainName,
		value: domainName,
	} ) );

	return (
		<>
			{ domainNames.length > 1 ? (
				<SelectControl
					value={ selectedDomainName }
					options={ domainNameOptions }
					onChange={ ( value ) => setSelectedDomainName( value ) }
				/>
			) : null }

			<Button
				href={ getProfessionalEmailCheckoutUpsellPath(
					siteSlug ?? selectedDomainName,
					selectedDomainName,
					receiptId
				) }
				onClick={ () =>
					recordTracksEvent( 'calypso_domain_only_thank_you_professional_email_click' )
				}
			>
				{ translate( 'Add email' ) }
			</Button>
		</>
	);
}

interface DomainOnlyThankYouProps {
	purchases: ReceiptPurchase[];
	receiptId: number;
}

export default function DomainOnlyThankYou( { purchases, receiptId }: DomainOnlyThankYouProps ) {
	const translate = useTranslate();
	const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );
	const domainNames = purchases.filter( predicate ).map( ( purchase ) => purchase?.meta );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const upsellProps: ThankYouUpsellProps = {
		title: translate( 'Professional email' ),
		description: (
			<>
				{ translate(
					'Establish credibility and build trust by using a custom email address.{{br /}}Studies show that 85% of people trust custom domain email addresses more than generic ones.',
					{
						comment: 'Upsell for Professional Email on checkout thank you page',
						components: { br: <br /> },
					}
				) }
			</>
		),
		image: emailImage,
		actions: <UpsellActions domainNames={ domainNames } receiptId={ receiptId } />,
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
					count: domainNames.length,
				}
			) }
			products={ products }
			footerDetails={ getDomainFooterDetails() }
			upsellProps={ upsellProps }
		/>
	);
}
