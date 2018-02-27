/** @format */
/**
 * External dependencies
 */
import React from 'react';

import NestedSidebarLink from '../../nested-sidebar-link';

export const DomainsExample = () => (
	<div>
		<h4>Domains</h4>
		<NestedSidebarLink route="settings/domains/manage">Manage</NestedSidebarLink>
		<NestedSidebarLink route="settings/domains/upgrades">Upgrades</NestedSidebarLink>
	</div>
);

export default DomainsExample;
