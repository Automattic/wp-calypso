import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { useDispatch } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import { onboardingUrl } from 'calypso/lib/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

export const AddNewSite = ( { title, icon } ) => {
	const reduxDispatch = useDispatch();

	const onNavigate = () => {
		reduxDispatch( recordTracksEvent( 'calypso_add_new_wordpress_click' ) );
		reduxDispatch( setLayoutFocus( 'content' ) );
	};

	return (
		<Fragment>
			<SidebarSeparator
				extraClassName="sidebar__separator--add-site"
				key="add-new-site-separator"
			/>
			<SidebarItem
				label={ title }
				link={ `${ onboardingUrl() }?ref=calypso-sidebar` }
				customIcon={ <SidebarCustomIcon icon={ icon } /> }
				onNavigate={ onNavigate }
			/>
		</Fragment>
	);
};

AddNewSite.propTypes = {
	title: TranslatableString.isRequired,
	icon: PropTypes.string.isRequired,
};

export default AddNewSite;
