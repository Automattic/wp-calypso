import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllSites from 'calypso/blocks/all-sites';
import Site from 'calypso/blocks/site';
import { SidebarV2Header as SidebarHeader } from 'calypso/layout/sidebar-v2';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
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
const useToggleSiteSelector = ( {
	forceAllSitesView,
	selectedSiteId,
}: {
	forceAllSitesView: boolean;
	selectedSiteId: number | null;
} ) => {
	const SITES_FOCUS = 'sites';
	const SIDEBAR_FOCUS = 'sidebar';

	const [ isVisible, setVisible ] = useState( false );
	const dispatch = useDispatch();

	return useCallback( () => {
		dispatch(
			forceAllSitesView
				? recordTracksEvent( 'calypso_jetpack_sidebar_switch_site_all_click' )
				: recordTracksEvent( 'calypso_jetpack_sidebar_switch_site_single_click', {
						site_id: selectedSiteId,
				  } )
		);

		// If the site selector is currently visible, make it not visible,
		// and vice versa
		const nextFocus = isVisible ? SIDEBAR_FOCUS : SITES_FOCUS;
		setVisible( ( val ) => ! val );
		dispatch( setLayoutFocus( nextFocus ) );
	}, [ dispatch, forceAllSitesView, isVisible, selectedSiteId ] );
};

const Header = ( { forceAllSitesView = false }: Props ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );

	const toggleSiteSelector = useToggleSiteSelector( { forceAllSitesView, selectedSiteId } );

	return (
		<SidebarHeader className="jetpack-cloud-sidebar__header">
			{ forceAllSitesView ? (
				<AllSites
					showIcon
					showChevronDownIcon
					showCount={ false }
					icon={ <AllSitesIcon /> }
					title={ translate( 'All Sites' ) }
					onSelect={ toggleSiteSelector }
				/>
			) : (
				<Site
					showChevronDownIcon
					className="jetpack-cloud-sidebar__selected-site"
					siteId={ selectedSiteId }
					onSelect={ toggleSiteSelector }
				/>
			) }
			<ProfileDropdown />
		</SidebarHeader>
	);
};

export default Header;
