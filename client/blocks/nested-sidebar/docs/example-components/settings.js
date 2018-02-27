/** @format */
/**
 * External dependencies
 */
import React from 'react';

import NestedSidebarLink from '../../nested-sidebar-link';

export const SettingsExample = () => (
	<div>
		<h4>Settings</h4>
		<NestedSidebarLink route="settings/domains">Domains</NestedSidebarLink>
		<NestedSidebarLink route="settings/discussion">Discussion</NestedSidebarLink>
	</div>
);

export default SettingsExample;
