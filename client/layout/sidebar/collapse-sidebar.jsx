/**
 * Collapse Sidebar Menu Item
 *
 */

import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import SidebarItem from 'calypso/layout/sidebar/item';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';

export const CollapseSidebar = ( { title, icon } ) => {
	const reduxDispatch = useDispatch();
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );

	const onNavigate = () => {
		reduxDispatch( recordTracksEvent( 'calypso_toggle_sidebar' ) );
		reduxDispatch( savePreference( 'sidebarCollapsed', ! sidebarIsCollapsed ) );
	};

	return (
		<SidebarItem
			className="collapse-sidebar__toggle"
			onNavigate={ onNavigate }
			label={ title }
			link={ '' }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
		/>
	);
};

CollapseSidebar.propTypes = {
	title: TranslatableString.isRequired,
	icon: PropTypes.string.isRequired,
};

export default CollapseSidebar;
