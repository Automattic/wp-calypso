/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import SidebarNavigation from 'client/components/sidebar-navigation';
import Gravatar from 'client/components/gravatar';
import userFactory from 'client/lib/user';

const user = userFactory();

const MeSidebarNavigation = ( { translate } ) => (
	<SidebarNavigation sectionName="me" sectionTitle={ translate( 'Me' ) }>
		<Gravatar user={ user.get() } size={ 30 } imgSize={ 400 } />
	</SidebarNavigation>
);

export default localize( MeSidebarNavigation );
