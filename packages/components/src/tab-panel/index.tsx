import styled, { StyledComponent } from '@emotion/styled';
import { TabPanel as CoreTabPanel } from '@wordpress/components';

export interface Tab extends Omit< CoreTabPanel.Tab, 'title' > {
	title: React.ReactChild;
}

export interface TabPanelProps extends Omit< CoreTabPanel.Props, 'children' | 'tabs' > {
	tabs: readonly Tab[];
	children: ( tab: Tab ) => JSX.Element;
}

/**
 * A wrapper around WordPress's own <TabPanel> component.
 *
 * - Adjust style so it aligns with what we want at Automattic
 * - Allows arbitrary elements in the tab titles (this is already possible with the
 *   WordPress component even though the documentation says only strings can be used).
 */
export const TabPanel: StyledComponent< TabPanelProps > = styled( CoreTabPanel )`
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
