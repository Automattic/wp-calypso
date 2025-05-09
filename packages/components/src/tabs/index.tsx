import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import type {
	TabsProps,
	TabsContextProps,
	TabListProps,
	TabProps,
	TabPanelProps,
} from '@wordpress/components/src/tabs/types';

// TODO: When the component is publicly available, we should remove the private API usage and
// import it directly from @wordpress/components as it will cause a build error.
const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { Tabs: CoreTabs } = unlock( privateApis );

/**
 * Tabs is a collection of React components that combine to render
 * an [ARIA-compliant tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
 *
 * Tabs organizes content across different screens, data sets, and interactions.
 * It has two sections: a list of tabs, and the view to show when a tab is chosen.
 *
 * `Tabs` itself is a wrapper component and context provider.
 * It is responsible for managing the state of the tabs, and rendering one instance of the `Tabs.TabList` component and one or more instances of the `Tab.TabPanel` component.
 */
export const Tabs = Object.assign( CoreTabs as ( props: TabsProps ) => React.JSX.Element, {
	/**
	 * Renders a single tab.
	 *
	 * The currently active tab receives default styling that can be
	 * overridden with CSS targeting `[aria-selected="true"]`.
	 */
	Tab: Object.assign( CoreTabs.Tab, {
		displayName: 'Tabs.Tab',
	} ) as React.ForwardRefExoticComponent<
		TabProps &
			Omit< React.HTMLAttributes< HTMLButtonElement >, 'id' > &
			React.RefAttributes< HTMLButtonElement >
	>,
	/**
	 * A wrapper component for the `Tab` components.
	 *
	 * It is responsible for rendering the list of tabs.
	 */
	TabList: Object.assign( CoreTabs.TabList, {
		displayName: 'Tabs.TabList',
	} ) as React.ForwardRefExoticComponent<
		TabListProps & React.HTMLAttributes< HTMLDivElement > & React.RefAttributes< HTMLDivElement >
	>,
	/**
	 * Renders the content to display for a single tab once that tab is selected.
	 */
	TabPanel: Object.assign( CoreTabs.TabPanel, {
		displayName: 'Tabs.TabPanel',
	} ) as React.ForwardRefExoticComponent<
		TabPanelProps & React.HTMLAttributes< HTMLDivElement > & React.RefAttributes< HTMLDivElement >
	>,
	Context: Object.assign( CoreTabs.Context, {
		displayName: 'Tabs.Context',
	} ) as React.Context< TabsContextProps >,
} );
