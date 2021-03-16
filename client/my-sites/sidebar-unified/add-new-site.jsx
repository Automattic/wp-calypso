/**
 * Collapse Sidebar Menu Item
 *
 **/

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getOnboardingUrl from 'calypso/state/selectors/get-onboarding-url';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import TranslatableString from 'calypso/components/translatable/proptype';

export const AddNewSite = ( { title, icon } ) => {
	const visibleSiteCount = useSelector( getCurrentUser ).visible_site_count;
	const onboardingUrl = useSelector( getOnboardingUrl );

	if ( visibleSiteCount > 1 ) {
		return null;
	}

	return (
		<Fragment>
			<SidebarSeparator key={ 'add-new-site-separator' } />
			<SidebarItem
				label={ title }
				link={ `${ onboardingUrl }?ref=calypso-sidebar` }
				customIcon={ <SidebarCustomIcon icon={ icon } /> }
			/>
		</Fragment>
	);
};

AddNewSite.propTypes = {
	title: TranslatableString.isRequired,
	icon: PropTypes.string.isRequired,
};

export default AddNewSite;
