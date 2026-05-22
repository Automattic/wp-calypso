/**
 * Storybook story for `<MySitesSidebarUnifiedSidebarGroup>`.
 *
 * Coverage matches the Phase 1 task 1.4 visual fixtures:
 *   - Collapsed, no attention (default plugins-group resting state).
 *   - Collapsed, with attention (group dot visible).
 *   - Expanded, with mixed children (children carry their own item-level
 *     signals; group dot suppressed).
 *   - Expanded, with no children (edge case — should still render the
 *     header without crashing).
 *   - Long label that needs the ellipsis safety net.
 *
 * The store state is mocked inline so the story renders without a backend.
 * The component reads `state.adminSidebarExpandState.bySite[siteId][groupId]`
 * and falls back to the group's `default_expanded` when nothing is stored.
 */

import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MySitesSidebarUnifiedSidebarGroup } from './sidebar-group';
import './sidebar-group.scss';
import type { Meta, StoryObj } from '@storybook/react';

const buildStore = ( preloaded: Record< string, unknown > = {} ) =>
	configureStore()( {
		ui: { selectedSiteId: 12345 },
		adminSidebarExpandState: { bySite: {} },
		...preloaded,
	} );

const StoryFrame = ( {
	children,
	state = {},
}: {
	children: React.ReactNode;
	state?: Record< string, unknown >;
} ) => (
	<Provider store={ buildStore( state ) }>
		<div
			style={ {
				width: 272,
				background: '#1d2327',
				padding: '8px 0',
				fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
			} }
		>
			<ul style={ { listStyle: 'none', margin: 0, padding: 0 } }>{ children }</ul>
		</div>
	</Provider>
);

const PlaceholderItem = ( { children }: { children: React.ReactNode } ) => (
	<li
		style={ {
			padding: '6px 12px 6px 36px',
			color: '#f0f0f1',
			fontSize: 13,
		} }
	>
		{ children }
	</li>
);

const meta: Meta< typeof MySitesSidebarUnifiedSidebarGroup > = {
	title: 'client/my-sites/sidebar/MySitesSidebarUnifiedSidebarGroup',
	component: MySitesSidebarUnifiedSidebarGroup,
	parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj< typeof MySitesSidebarUnifiedSidebarGroup >;

export const CollapsedNoAttention: Story = {
	render: ( args ) => (
		<StoryFrame>
			<MySitesSidebarUnifiedSidebarGroup { ...args }>
				<PlaceholderItem>Yoast SEO</PlaceholderItem>
				<PlaceholderItem>WooCommerce</PlaceholderItem>
			</MySitesSidebarUnifiedSidebarGroup>
		</StoryFrame>
	),
	args: {
		group: {
			id: 'plugins',
			label: 'My Plugins',
			default_expanded: false,
			signal: { attention: false, count: 0 },
		},
		expanded: false,
		siteId: 12345,
	},
};

export const CollapsedWithAttention: Story = {
	render: ( args ) => (
		<StoryFrame>
			<MySitesSidebarUnifiedSidebarGroup { ...args }>
				<PlaceholderItem>Yoast SEO</PlaceholderItem>
				<PlaceholderItem>WooCommerce</PlaceholderItem>
			</MySitesSidebarUnifiedSidebarGroup>
		</StoryFrame>
	),
	args: {
		group: {
			id: 'plugins',
			label: 'My Plugins',
			default_expanded: false,
			signal: { attention: true, count: 3 },
		},
		expanded: false,
		siteId: 12345,
	},
};

export const ExpandedWithMixedChildren: Story = {
	render: ( args ) => (
		<StoryFrame>
			<MySitesSidebarUnifiedSidebarGroup { ...args }>
				<PlaceholderItem>Yoast SEO (3)</PlaceholderItem>
				<PlaceholderItem>WooCommerce</PlaceholderItem>
				<PlaceholderItem>Jetpack BETA</PlaceholderItem>
			</MySitesSidebarUnifiedSidebarGroup>
		</StoryFrame>
	),
	args: {
		group: {
			id: 'plugins',
			label: 'My Plugins',
			// `default_expanded: false` matches the contract; `expanded: true`
			// here is the per-story override (this story shows the expanded
			// state regardless of the default).
			default_expanded: false,
			signal: { attention: true, count: 3 },
		},
		expanded: true,
		siteId: 12345,
	},
};

export const ExpandedWithNoChildren: Story = {
	render: ( args ) => (
		<StoryFrame>
			<MySitesSidebarUnifiedSidebarGroup { ...args } />
		</StoryFrame>
	),
	args: {
		group: {
			id: 'plugins',
			label: 'My Plugins',
			default_expanded: false,
			signal: { attention: false, count: 0 },
		},
		expanded: true,
		siteId: 12345,
	},
};

export const LongLabelEllipsis: Story = {
	render: ( args ) => (
		<StoryFrame>
			<MySitesSidebarUnifiedSidebarGroup { ...args }>
				<PlaceholderItem>Item one</PlaceholderItem>
			</MySitesSidebarUnifiedSidebarGroup>
		</StoryFrame>
	),
	args: {
		group: {
			id: 'plugins',
			label: 'A very long group label that needs the ellipsis safety net to avoid wrapping',
			default_expanded: false,
			signal: { attention: false, count: 0 },
		},
		expanded: false,
		siteId: 12345,
	},
};
