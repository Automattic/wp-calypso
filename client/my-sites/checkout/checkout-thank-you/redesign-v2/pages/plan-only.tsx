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
	purchases: ReceiptPurchase[];
}

export default function PlanOnlyThankYou( { purchases }: PlanOnlyThankYouProps ) {
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

	// Promote themes in the footer details for sites that are 6 months old or older.
	if ( isMonthsOld( siteCreatedTimeStamp ?? '', 6 ) ) {
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

	const products = purchases.map( ( purchase ) => {
		return (
			<ThankYouPlanProduct
				purchase={ purchase }
				key={ `plan-${ purchase.productSlug }` }
				siteSlug={ siteSlug }
				siteId={ siteId }
			/>
		);
	} );

	return (
		<ThankYouV2
			title={ translate( 'Get the best out of your site' ) }
			subtitle={ preventWidows(
				translate(
					'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan',
					{
						args: { productName: purchases[ 0 ].productName },
						components: { strong: <strong /> },
					}
				)
			) }
			products={ products }
			footerDetails={ footerDetails }
		/>
	);
}
