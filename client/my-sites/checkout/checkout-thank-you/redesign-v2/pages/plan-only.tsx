import { translate } from 'i18n-calypso';
import moment from 'moment';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { getSiteOptions, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ProductPlan from '../products/product-plan';

interface PlanOnlyThankYouProps {
	purchases: ReceiptPurchase[];
}

export const PlanOnlyThankYou: React.FC< PlanOnlyThankYouProps > = ( { purchases } ) => {
	const isMonthsOld = ( rawDate: string, months: number ) => {
		if ( ! rawDate || ! months ) {
			return false;
		}

		const parsedDate = moment( rawDate );
		return moment().diff( parsedDate, 'months' ) > months;
	};

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const siteCreatedTimeStamp = useSelector(
		( state ) => getSiteOptions( state, siteId ?? 0 )?.created_at
	);

	// If the site has more than 6 months we consider it old for this purpose.
	const isOldSite = isMonthsOld( siteCreatedTimeStamp ?? '', 6 );

	const purchaseDetailsProps = [];

	if ( isOldSite ) {
		purchaseDetailsProps.push( {
			title: translate( 'A site refresh' ),
			description: translate(
				'A new look and feel can help you stand out from the crowd. Get a new theme and make an impression.'
			),
			buttonText: translate( 'Find your new theme' ),
			href: `/themes/${ siteSlug }`,
			onClick: () => recordTracksEvent( 'calypso_plan_thank_you_theme_click' ),
		} );
	}

	purchaseDetailsProps.push( {
		title: translate( 'Everything you need to know' ),
		description: translate( 'Explore our support guides and find an answer to every question.' ),
		buttonText: translate( 'Explore support resources' ),
		href: '/support',
		target: '_blank',
		onClick: () => recordTracksEvent( 'calypso_plan_thank_you_support_click' ),
	} );

	const products = purchases.map( ( purchase, index ) => {
		return (
			<ProductPlan purchase={ purchase } key={ index } siteSlug={ siteSlug } siteId={ siteId } />
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
			purchaseDetailsProps={ purchaseDetailsProps }
		/>
	);
};
