/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import SidebarNavigation from 'components/sidebar-navigation';
import userFactory from 'lib/user';

const user = userFactory();

const MeSidebarNavigation = ( { translate } ) => (
	<SidebarNavigation
		sectionName="me"
		sectionTitle={ translate( 'Me' ) }>
		<Gravatar user={ user.get() } size={ 30 } imgSize={ 400 } />
	</SidebarNavigation>
);

export default localize( MeSidebarNavigation );
