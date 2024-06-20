import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useDispatch, useSelect } from '@wordpress/data';
import AsyncLoad from 'calypso/components/async-load';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail, getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSection, getSelectedSiteId } from 'calypso/state/ui/selectors';

const HELP_CENTER_STORE = HelpCenter.register();

const AsyncHelpCenter = () => {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const isShowingHelpCenter = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const locale = useLocale();
	const sectionName = useSelector( getSection );
	const currentUserId = useSelector( getCurrentUserId );
	const currentUserEmail = useSelector( getCurrentUserEmail );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const userPurchases = useSelector( getUserPurchases );
	const hasPurchases = useSelector( hasCancelableUserPurchases );
	const primarySiteId = useSelector( getPrimarySiteId );
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, selectedSiteId ) );
	const isJetpack = useSelector( ( state ) =>
		isJetpackSite( state, selectedSiteId, { treatAtomicAsJetpackSite: false } )
	);
	const purchases = useSelector( getUserPurchases );
	const purchaseSlugs = purchases && purchases.map( ( purchase ) => purchase.productSlug );
	const isBusinessOrEcomPlanUser = !! (
		purchaseSlugs &&
		( purchaseSlugs.some( isWpComBusinessPlan ) || purchaseSlugs.some( isWpComEcommercePlan ) )
	);

	const handleClose = () => setShowHelpCenter( false );

	if ( ! isShowingHelpCenter ) {
		return null;
	}

	return (
		<AsyncLoad
			require="@automattic/help-center"
			adminUrl={ adminUrl }
			isJetpackSite={ isJetpack }
			isBusinessOrEcomPlanUser={ isBusinessOrEcomPlanUser }
			locale={ locale }
			sectionName={ sectionName }
			currentUserId={ currentUserId }
			currentUserEmail={ currentUserEmail }
			selectedSiteId={ selectedSiteId }
			userPurchases={ userPurchases }
			hasPurchases={ hasPurchases }
			primarySiteId={ primarySiteId }
			placeholder={ null }
			handleClose={ handleClose }
		/>
	);
};

export default AsyncHelpCenter;
