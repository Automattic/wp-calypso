import {
	isGoogleWorkspaceExtraLicence,
	isGSuiteExtraLicenseProductSlug,
} from '@automattic/calypso-products';
import { CONTACT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { ThankYouGoogleWorkspaceProduct } from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/products/google-workspace-product';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

type GoogleWorkspaceSetUpThankYouProps = {
	purchase: ReceiptPurchase;
};

const GOOGLE_WORKSPACE_SUPPORT_DOC_ID = 92531;

export const GoogleWorkspaceSetUpThankYou = ( { purchase }: GoogleWorkspaceSetUpThankYouProps ) => {
	const domainName = purchase.meta;
	const productFamily = getGoogleMailServiceFamily( purchase?.productSlug );
	const selectedSite = useSelector( getSelectedSite );
	const translate = useTranslate();
	const email = useSelector( getCurrentUserEmail );

	const footerDetails = [
		{
			key: 'footer-email',
			title: translate( 'Email questions? We have the answers' ),
			description: translate(
				'Explore our comprehensive support guides and find solutions to all your email-related questions.'
			),
			buttonText: translate( 'Email support resources' ),
			supportDoc: {
				url: '/support/add-email/adding-google-workspace-to-your-site/',
				id: GOOGLE_WORKSPACE_SUPPORT_DOC_ID,
			},
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: 'google-workspace',
					type: 'google-workspace-support',
				} );
			},
		},
	];

	let title;
	let subtitle;

	if (
		isGoogleWorkspaceExtraLicence( purchase ) ||
		isGSuiteExtraLicenseProductSlug( purchase.productSlug )
	) {
		title = translate( 'Say hello to your new email address' );
		subtitle = translate( "All set! Now it's time to update your contact details." );
	} else {
		title = translate( 'Congratulations on your purchase!' );
		subtitle = translate(
			"{{strong}}Keep an eye on your email to finish setting up your new email addresses.{{/strong}} We are setting up your new Google Workspace users but this process can take several minutes. We will email you at %(email)s with login information once they are ready but if you still haven't received anything after a few hours, do not hesitate to {{link}}contact support{{/link}}.",
			{
				components: {
					strong: <strong />,
					link: <a href={ CONTACT } rel="noopener noreferrer" target="_blank" />,
				},
				args: {
					email,
				},
			}
		);
	}

	const products = (
		<ThankYouGoogleWorkspaceProduct
			productFamily={ productFamily }
			domainName={ domainName }
			siteSlug={ selectedSite?.slug }
			numberOfMailboxesPurchased={ purchase.newQuantity }
		/>
	);

	return (
		<>
			<ThankYouV2
				title={ title }
				subtitle={ subtitle }
				products={ products }
				footerDetails={ footerDetails }
			/>
		</>
	);
};
