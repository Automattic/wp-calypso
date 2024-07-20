import { Button, SelectControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.jpg';
import QuerySites from 'calypso/components/data/query-sites';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { ThankYouUpsellProps } from 'calypso/components/thank-you-v2/upsell';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getProfessionalEmailCheckoutUpsellPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getDomainPurchaseTypeAndPredicate } from '../../utils';
import ThankYouDomainProduct from '../products/domain-product';
import getDomainFooterDetails from './content/get-domain-footer-details';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

function UpsellActions( {
	domainNames,
	receiptId,
	siteSlug,
}: {
	domainNames: string[];
	receiptId: number;
	siteSlug?: string;
} ) {
	const translate = useTranslate();
	const [ selectedDomainName, setSelectedDomainName ] = useState( domainNames[ 0 ] );

	const domainNameOptions = domainNames.map( ( domainName ) => ( {
		label: domainName,
		value: domainName,
	} ) );

	const addEmailButtonHref =
		siteSlug && getProfessionalEmailCheckoutUpsellPath( siteSlug, selectedDomainName, receiptId );
	const addEmailButtonProps = addEmailButtonHref
		? { href: addEmailButtonHref }
		: { disabled: true };

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
				onClick={ () =>
					recordTracksEvent( 'calypso_domain_only_thank_you_professional_email_click' )
				}
				{ ...addEmailButtonProps }
			>
				{ translate( 'Add email' ) }
			</Button>
		</>
	);
}

interface DomainOnlyThankYouProps {
	purchases: ReceiptPurchase[];
	receiptId: number;
	isGravatarDomain: boolean;
}

export default function DomainOnlyThankYou( {
	purchases,
	receiptId,
	isGravatarDomain,
}: DomainOnlyThankYouProps ) {
	const translate = useTranslate();
	const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );
	const domainPurchases = purchases.filter( predicate );
	const domainNames = domainPurchases.map( ( purchase ) => purchase?.meta );
	const domainOnlySite = useSelector( ( state ) => getSite( state, domainPurchases[ 0 ]?.blogId ) );

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
		actions: (
			<UpsellActions
				domainNames={ domainNames }
				receiptId={ receiptId }
				siteSlug={ domainOnlySite?.slug }
			/>
		),
	};

	const products = domainPurchases.map( ( purchase ) => {
		return (
			<ThankYouDomainProduct
				purchase={ purchase }
				key={ `domain-${ purchase.meta }` }
				siteSlug={ domainOnlySite?.slug }
				isDomainOnly
				isGravatarDomain={ isGravatarDomain }
			/>
		);
	} );

	const { setShowSupportDoc } = useDispatch( 'automattic/help-center' );

	return (
		<>
			<QuerySites siteId={ domainPurchases[ 0 ]?.blogId } />

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
				footerDetails={ getDomainFooterDetails( 'domain-only', setShowSupportDoc ) }
				upsellProps={ upsellProps }
				isGravatarDomain={ isGravatarDomain }
			/>
		</>
	);
}
