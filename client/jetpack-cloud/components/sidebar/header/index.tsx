import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllSites from 'calypso/blocks/all-sites';
import Site from 'calypso/blocks/site';
import { SidebarV2Header as SidebarHeader } from 'calypso/layout/sidebar-v2';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { AppState } from 'calypso/types';
import JetpackLogo from './jetpack-logo.svg';
import ProfileDropdown from './profile-dropdown';

type Props = {
	forceAllSitesView?: boolean;
};

const AllSitesIcon = () => (
	<img
		className="jetpack-cloud-sidebar__all-sites-icon"
		src={ JetpackLogo }
		alt=""
		role="presentation"
	/>
);

// NOTE: This hook is a little hacky, to get around the "outside click"
// close behavior that happens inside `<SiteSelector />`. Instead of
// using the `getCurrentLayoutFocus` selector, we use internal state to
// derive whether or not the site selector should be visible.
const useShowSiteSelector = ( {
	forceAllSitesView,
	selectedSiteId,
}: {
	forceAllSitesView: boolean;
	selectedSiteId: number | null;
} ) => {
	const SITES_FOCUS = 'sites';

	const isSiteSelectorVisible = useSelector(
		( state: AppState ) => getCurrentLayoutFocus( state ) === SITES_FOCUS
	);
	const dispatch = useDispatch();

	return useCallback( () => {
		dispatch(
			forceAllSitesView
				? recordTracksEvent( 'calypso_jetpack_sidebar_switch_site_all_click' )
				: recordTracksEvent( 'calypso_jetpack_sidebar_switch_site_single_click', {
						site_id: selectedSiteId,
				  } )
		);

		// NOTE: If the selector is visible, dismissal will happen automatically
		// when the user clicks outside the bounds of its root element
		if ( ! isSiteSelectorVisible ) {
			dispatch( setLayoutFocus( SITES_FOCUS ) );
		}
	}, [ dispatch, forceAllSitesView, isSiteSelectorVisible, selectedSiteId ] );
};

const Header = ( { forceAllSitesView = false }: Props ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );

	const showSiteSelector = useShowSiteSelector( { forceAllSitesView, selectedSiteId } );

	return (
		<SidebarHeader className="jetpack-cloud-sidebar__header">
			{ forceAllSitesView ? (
				<AllSites
					showIcon
					showChevronDownIcon
					showCount={ false }
					icon={ <AllSitesIcon /> }
					title={ translate( 'All Sites' ) }
					onSelect={ showSiteSelector }
				/>
			) : (
				<Site
					showChevronDownIcon
					className="jetpack-cloud-sidebar__selected-site"
					siteId={ selectedSiteId }
					onSelect={ showSiteSelector }
				/>
			) }
			<ProfileDropdown />
		</SidebarHeader>
	);
};

export default Header;
