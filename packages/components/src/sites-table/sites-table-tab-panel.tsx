import styled, { StyledComponent } from '@emotion/styled';
import { TabPanel } from '@wordpress/components';

export interface SitesTableTab extends Omit< TabPanel.Tab, 'title' > {
	title: React.ReactChild;
}

export interface TabPanelProps extends Omit< TabPanel.Props, 'children' | 'tabs' > {
	tabs: readonly SitesTableTab[];
	children: ( tab: SitesTableTab ) => JSX.Element;
}

/**
 * A wrapper around WordPress's <TabPanel> component.
 *
 * - Adjust style so it aligns with what we want in the Sites Dashboard
 * - Allows arbitrary elements in the tab titles so that we can show site counts (this is already possible
 *   with the WordPress component even though the documentation says only strings can be used).
 */
export const SitesTableTabPanel: StyledComponent< TabPanelProps > = styled( TabPanel )`
	.components-tab-panel__tabs {
		overflow-x: auto;
	}

	.components-tab-panel__tabs-item {
		--wp-admin-theme-color: var( --studio-gray-100 );
		color: var( --studio-gray-60 );
		padding: 0;
		margin-right: 24px;
		font-size: 16px;
		flex-shrink: 0;
	}
	.components-tab-panel__tabs-item:hover,
	.components-tab-panel__tabs-item.is-active,
	.components-tab-panel__tabs-item.is-active:focus,
	.components-tab-panel__tabs-item:focus:not( :disabled ) {
		box-shadow: inset 0 -2px 0 0 var( --wp-admin-theme-color );
		color: var( --studio-gray-100 );
	}
` as any;
