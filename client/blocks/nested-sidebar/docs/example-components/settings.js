/** @format */
/**
 * External dependencies
 */
import React from 'react';

import NestedSidebarItem from '../../nested-sidebar-item';
import NestedSidebarParentLink from '../../nested-sidebar-parent-link';

import DomainsExample from './domains';
import DiscussionExample from './discussion';

export const SettingsExample = () => (
	<div>
		<h4>Settings Sidebar</h4>
		<NestedSidebarParentLink />
		<NestedSidebarItem
			route="settings/domains"
			label="Domains"
			parent="settings"
			component={ DomainsExample }
		/>
		<NestedSidebarItem
			route="settings/discussion"
			label="Discussion"
			parent="settings"
			component={ DiscussionExample }
		/>
	</div>
);

export default SettingsExample;
