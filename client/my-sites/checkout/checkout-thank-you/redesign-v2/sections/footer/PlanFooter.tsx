import { translate } from 'i18n-calypso';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PlanFooter = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	return (
		<div>
			<PurchaseDetail
				title={ translate( 'A site refresh' ) }
				description={ translate(
					'A new look and feel can help you stand out from the crowd. Get a new theme and make an impression.'
				) }
				buttonText={ translate( 'Find your new theme' ) }
				href={ `/themes/${ siteSlug }` }
				onClick={ () => recordTracksEvent( 'calypso_plan_thank_you_theme_click' ) }
			/>

			<PurchaseDetail
				title={ translate( 'Everything you need to know' ) }
				description={ translate(
					'Explore our support guides and find an answer to every question.'
				) }
				buttonText={ translate( 'Explore support resources' ) }
				href="/support"
				onClick={ () => recordTracksEvent( 'calypso_plan_thank_you_support_click' ) }
			/>
		</div>
	);
};

export default PlanFooter;
