import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Site from 'calypso/blocks/site';
import { SidebarV2Header as SidebarHeader } from 'calypso/layout/sidebar-v2';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackLogo from './jetpack-logo.svg';
import ProfileDropdown from './profile-dropdown';

const AllSitesHeader = () => {
	const translate = useTranslate();
	return (
		<div className="jetpack-cloud-sidebar__all-sites">
			<img
				className="jetpack-cloud-sidebar__all-sites-icon"
				src={ JetpackLogo }
				alt=""
				role="presentation"
			/>
			<span className="jetpack-cloud-sidebar__all-sites-label">{ translate( 'All Sites' ) }</span>
		</div>
	);
};

const Header = () => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return (
		<SidebarHeader className="jetpack-cloud-sidebar__header">
			{ selectedSiteId ? <Site siteId={ selectedSiteId } /> : <AllSitesHeader /> }
			<ProfileDropdown />
		</SidebarHeader>
	);
};

export default Header;
