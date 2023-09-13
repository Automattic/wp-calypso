import { translate } from 'i18n-calypso';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const P2PlusPlanFooter = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	return (
		<div>
			<PurchaseDetail
				title={ translate( 'Go further, together' ) }
				description={ translate(
					'Invite people to the P2 to create a fully interactive work environment and start getting better results.'
				) }
				buttonText={ translate( 'Add members' ) }
				href={ `/people/new/${ siteSlug }` }
				onClick={ () => recordTracksEvent( 'calypso_plan_thank_you_add_members_click' ) }
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

export default P2PlusPlanFooter;
