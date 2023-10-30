import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
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

const Header = ( { forceAllSitesView = false }: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );

	const onSelectSite = useCallback( () => {
		dispatch( setLayoutFocus( 'sites' ) );
		dispatch(
			forceAllSitesView
				? recordTracksEvent( 'calypso_jetpack_sidebar_switch_site_all_click' )
				: recordTracksEvent( 'calypso_jetpack_sidebar_switch_site_single_click', {
						site_id: selectedSiteId,
				  } )
		);
	}, [ dispatch, forceAllSitesView, selectedSiteId ] );

	return (
		<SidebarHeader className="jetpack-cloud-sidebar__header">
			{ forceAllSitesView ? (
				<AllSites
					showIcon
					showChevronDownIcon
					showCount={ false }
					icon={ <AllSitesIcon /> }
					title={ translate( 'All Sites' ) }
					onSelect={ onSelectSite }
				/>
			) : (
				<Site
					showChevronDownIcon
					className="jetpack-cloud-sidebar__selected-site"
					siteId={ selectedSiteId }
					onSelect={ onSelectSite }
				/>
			) }
			<ProfileDropdown />
		</SidebarHeader>
	);
};

export default Header;
