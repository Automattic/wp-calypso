import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import React from 'react';
import type { TabsProps } from '@wordpress/components/src/tabs/types';

// TODO: When the component is publicly available, we should remove the private API usage and
// import it directly from @wordpress/components as it will cause a build error.
const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { Tabs: CoreTabs } = unlock( privateApis );

/**
 * A wrapper component around WordPress's private [`Tabs` component](https://wordpress.github.io/gutenberg/?path=/docs/components-tabs--docs)
 * from `@wordpress/components`.
 *
 * ```jsx
 * import { Tabs } from '@automattic/components';
 *
 * function MyComponent() {
 * 	return (
 * 		<Tabs
 * 			onActiveTabIdChange={() => {}}
 * 			onSelect={() => {}}
 * 		>
 * 			<Tabs.TabList>
 * 				<Tabs.Tab tabId="tab1">
 * 					Tab 1
 * 				</Tabs.Tab>
 * 				<Tabs.Tab tabId="tab2">
 * 					Tab 2
 * 				</Tabs.Tab>
 * 			</Tabs.TabList>
 * 			<Tabs.TabPanel tabId="tab1">
 * 				<p>
 * 					Selected tab: Tab 1
 * 				</p>
 * 			</Tabs.TabPanel>
 * 			<Tabs.TabPanel tabId="tab2">
 * 				<p>
 * 					Selected tab: Tab 2
 * 				</p>
 * 			</Tabs.TabPanel>
 * 		</Tabs>
 * 	);
 * }
 * ```
 */
const Tabs = ( props: TabsProps ) => {
	return <CoreTabs { ...props } />;
};

export default Tabs;
