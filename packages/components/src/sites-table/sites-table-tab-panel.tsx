import styled from '@emotion/styled';
import { TabPanel } from '@wordpress/components';
import type { ComponentType } from 'react';

// The TabPanel.Tab type uses property indexing which means it doesn't work
// with the usual Omit helper type, see:
// https://stackoverflow.com/questions/54826012/using-omit-type-on-classes-with-a-index-type-signature-results-in-minimum-proper
type OmitFromIndexedTypeWhilePreservingProperties< T, K extends PropertyKey > = {
	[ P in keyof T as Exclude< P, K > ]: T[ P ];
};

export interface SitesTableTab
	extends OmitFromIndexedTypeWhilePreservingProperties< TabPanel.Tab, 'title' > {
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
export const SitesTableTabPanel = styled( TabPanel as ComponentType< TabPanelProps > )`
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
`;
