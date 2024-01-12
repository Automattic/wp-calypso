import { isP2Plus } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { getSiteOptions } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ThankYouPlanProduct from '../products/plan-product';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

interface PlanOnlyThankYouProps {
	purchase: ReceiptPurchase;
}

export default function PlanOnlyThankYou( { purchase }: PlanOnlyThankYouProps ) {
	const isMonthsOld = ( rawDate: string, months: number ) => {
		if ( ! rawDate || ! months ) {
			return false;
		}

		const parsedDate = moment( rawDate );
		return moment().diff( parsedDate, 'months' ) > months;
	};

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteCreatedTimeStamp = useSelector(
		( state ) => getSiteOptions( state, siteId ?? 0 )?.created_at
	);

	const footerDetails = [];

	if ( isP2Plus( purchase ) ) {
		footerDetails.push( {
			key: 'footer-add-members',
			title: translate( 'Go further, together' ),
			description: translate(
				'Invite people to the P2 to create a fully interactive work environment and start getting better results.'
			),
			buttonText: translate( 'Add members' ),
			buttonHref: `/people/new/${ siteSlug }`,
			buttonOnClick: () => {
				recordTracksEvent( 'calypso_plan_thank_you_add_members_click' );
			},
		} );
	} else if ( isMonthsOld( siteCreatedTimeStamp ?? '', 6 ) ) {
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
				recordTracksEvent( 'calypso_plan_thank_you_theme_click' );
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
			recordTracksEvent( 'calypso_plan_thank_you_support_click' );
		},
	} );

	return (
		<ThankYouV2
			title={ translate( 'Get the best out of your site' ) }
			subtitle={ preventWidows(
				translate(
					'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan',
					{
						args: { productName: purchase.productName },
						components: { strong: <strong /> },
					}
				)
			) }
			products={
				<ThankYouPlanProduct purchase={ purchase } siteSlug={ siteSlug } siteId={ siteId } />
			}
			footerDetails={ footerDetails }
		/>
	);
}
