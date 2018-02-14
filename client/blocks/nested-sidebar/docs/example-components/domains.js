/** @format */
/**
 * External dependencies
 */
import React from 'react';

import NestedSidebarItem from '../../nested-sidebar-item';
import NestedSidebarParentLink from '../../nested-sidebar-parent-link';

import DomainsManageExample from './domains-manage';
import DomainUpgradesExample from './domains-upgrades';

export const DomainsExample = () => (
	<div>
		<h4>Domains Sidebar</h4>
		<NestedSidebarParentLink />
		<NestedSidebarItem
			route="settings/domains/manage"
			label="Manage"
			parent="settings/domains"
			component={ DomainsManageExample }
		/>
		<NestedSidebarItem
			route="settings/domains/upgrades"
			label="Upgrades"
			parent="settings/domains"
			component={ DomainUpgradesExample }
		/>
	</div>
);

export default DomainsExample;
