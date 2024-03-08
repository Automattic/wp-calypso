import { isP2Plus } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { getSiteOptions } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ThankYouPlanProduct from '../products/plan-product';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

interface PlanOnlyThankYouProps {
	primaryPurchase: ReceiptPurchase;
}

const isMonthsOld = ( months: number, rawDate?: string ) => {
	if ( ! rawDate ) {
		return false;
	}

	const parsedDate = moment( rawDate );
	return moment().diff( parsedDate, 'months' ) > months;
};

export default function PlanOnlyThankYou( { primaryPurchase }: PlanOnlyThankYouProps ) {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteCreatedTimeStamp = useSelector(
		( state ) => getSiteOptions( state, siteId ?? 0 )?.created_at
	);

	const footerDetails = [];

	if ( isP2Plus( primaryPurchase ) ) {
		footerDetails.push( {
			key: 'footer-add-members',
			title: translate( 'Go further, together' ),
			description: translate(
				'Invite people to the P2 to create a fully interactive work environment and start getting better results.'
			),
			buttonText: translate( 'Add members' ),
			buttonHref: `/people/new/${ siteSlug }`,
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: 'plan-only',
					type: 'add-members',
				} );
			},
		} );
	} else if ( isMonthsOld( 6, siteCreatedTimeStamp ) ) {
		// Promote themes in the footer details for sites that are 6 months old or older.
		footerDetails.push( {
			key: 'footer-site-refresh',
			title: translate( 'A site refresh' ),
			description: translate(
				'A new look and feel can help you stand out from the crowd. Get a new theme and make an impression.'
			),
			buttonText: translate( 'Find your new theme' ),
			buttonHref: `/themes/${ siteSlug }`,
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_thank_you_footer_link_click', {
					context: 'plan-only',
					type: 'site-refresh',
				} );
			},
		} );
	}

	footerDetails.push( {
		key: 'footer-support',
		title: translate( 'Everything you need to know' ),
		description: translate( 'Explore our support guides and find an answer to every question.' ),
		buttonText: translate( 'Explore support resources' ),
		buttonHref: '/support',
		buttonOnClick: () => {
			recordTracksEvent( 'calypso_thank_you_footer_link_click', {
				context: 'plan-only',
				type: 'support',
			} );
		},
	} );

	return (
		<ThankYouV2
			title={ translate( 'Get the best out of your site' ) }
			subtitle={ preventWidows(
				translate(
					'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan',
					{
						args: { productName: primaryPurchase.productName },
						components: { strong: <strong /> },
					}
				)
			) }
			products={
				<ThankYouPlanProduct purchase={ primaryPurchase } siteSlug={ siteSlug } siteId={ siteId } />
			}
			footerDetails={ footerDetails }
		/>
	);
}
