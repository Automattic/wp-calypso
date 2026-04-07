import { SidebarV2Header as SidebarHeader } from 'calypso/layout/sidebar-v2';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
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
	const agency = useSelector( getActiveAgency );

	return (
		<SidebarHeader className="a4a-sidebar__header">
			<AllSitesIcon />
			{ agency?.name && (
				<span className="a4a-sidebar__agency-name" title={ agency.name }>
					{ agency.name }
				</span>
			) }
			{ withProfileDropdown && <ProfileDropdown /> }
		</SidebarHeader>
	);
};

export default Header;
