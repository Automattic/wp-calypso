/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';

const SettingsTopLevel: FunctionComponent = ( { children } ) => {
	const translate = useTranslate();
	return (
		<Main className="settings">
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			{ children }
		</Main>
	);
};

export default SettingsTopLevel;
