import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useOnboardingUrl from 'calypso/components/site-selector/use-onboarding-url';
import TranslatableString from 'calypso/components/translatable/proptype';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

export const AddNewSite = ( { title, icon } ) => {
	const reduxDispatch = useDispatch();
	const onboardingUrl = useOnboardingUrl();
	const visibleSiteCount = useSelector( getCurrentUser ).visible_site_count;
	if ( ! onboardingUrl ) {
		return null;
	}
	if ( visibleSiteCount > 1 ) {
		return null;
	}

	const onNavigate = () => {
		reduxDispatch( recordTracksEvent( 'calypso_add_new_wordpress_click' ) );
		reduxDispatch( setLayoutFocus( 'content' ) );
	};

	return (
		<Fragment>
			<SidebarSeparator key={ 'add-new-site-separator' } />
			<SidebarItem
				label={ title }
				link={ `${ onboardingUrl }?ref=calypso-sidebar` }
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
