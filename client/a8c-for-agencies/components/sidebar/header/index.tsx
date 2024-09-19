import { SidebarV2Header as SidebarHeader } from 'calypso/layout/sidebar-v2';
import A4ALogo, { LOGO_COLOR_SECONDARY_ALT } from '../../a4a-logo';
import ProfileDropdown from './profile-dropdown';

type Props = {
	withProfileDropdown?: boolean;
};

const AllSitesIcon = () => (
	<A4ALogo
		className="a4a-sidebar__all-sites-icon"
		colors={ { secondary: LOGO_COLOR_SECONDARY_ALT } }
		size={ 32 }
	/>
);

const Header = ( { withProfileDropdown }: Props ) => {
	return (
		<SidebarHeader className="a4a-sidebar__header">
			<AllSitesIcon />
			{ withProfileDropdown && <ProfileDropdown compact /> }
		</SidebarHeader>
	);
};

export default Header;
