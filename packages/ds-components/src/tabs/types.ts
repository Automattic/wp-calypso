/**
 * External dependencies
 */
import type * as Ariakit from '@ariakit/react';

export type TabsContextProps =
	| {
			/**
			 * The tabStore object returned by Ariakit's `useTabStore` hook.
			 */
			store: Ariakit.TabStore;
			/**
			 * The unique id string for this instance of the Tabs component.
			 */
			instanceId: string;
	  }
	| undefined;

export type TabsProps = {
	/**
	 * The children elements, which should include one instance of the
	 * `Tabs.Tablist` component and as many instances of the `Tabs.TabPanel`
	 * components as there are `Tabs.Tab` components.
	 */
	children: Ariakit.TabProviderProps[ 'children' ];
	/**
	 * Determines if the tab should be selected when it receives focus. If set to
	 * `false`, the tab will only be selected upon clicking, not when using arrow
	 * keys to shift focus (manual tab activation). See the [official W3C docs](https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/)
	 * for more info.
	 *
	 * @default true
	 */
	selectOnMove?: Ariakit.TabProviderProps[ 'selectOnMove' ];
	/**
	 * The id of the tab whose panel is currently visible.
	 *
	 * If left `undefined`, it will be automatically set to the first enabled
	 * tab, and the component assumes it is being used in "uncontrolled" mode.
	 *
	 * Consequently, any value different than `undefined` will set the component
	 * in "controlled" mode. When in "controlled" mode, the `null` value will
	 * result in no tabs being selected, and the tablist becoming tabbable.
	 */
	selectedTabId?: Ariakit.TabProviderProps[ 'selectedId' ];
	/**
	 * The id of the tab whose panel is currently visible.
	 *
	 * If left `undefined`, it will be automatically set to the first enabled
	 * tab. If set to `null`, no tab will be selected, and the tablist will be
	 * tabbable.
	 *
	 * Note: this prop will be overridden by the `selectedTabId` prop if it is
	 * provided (meaning the component will be used in "controlled" mode).
	 */
	defaultTabId?: Ariakit.TabProviderProps[ 'defaultSelectedId' ];
	/**
	 * The function called when the `selectedTabId` changes.
	 */
	onSelect?: Ariakit.TabProviderProps[ 'setSelectedId' ];
	/**
	 * The current active tab `id`. The active tab is the tab element within the
	 * tablist widget that has DOM focus.
	 *
	 * - `null` represents the tablist (ie. the base composite element). Users
	 *   will be able to navigate out of it using arrow keys.
	 * - If `activeTabId` is initially set to `null`, the base composite element
	 *   itself will have focus and users will be able to navigate to it using
	 *   arrow keys.
	 */
	activeTabId?: Ariakit.TabProviderProps[ 'activeId' ];
	/**
	 * The tab id that should be active by default when the composite widget is
	 * rendered. If `null`, the tablist element itself will have focus
	 * and users will be able to navigate to it using arrow keys. If `undefined`,
	 * the first enabled item will be focused.
	 *
	 * Note: this prop will be overridden by the `activeTabId` prop if it is
	 * provided.
	 */
	defaultActiveTabId?: Ariakit.TabProviderProps[ 'defaultActiveId' ];
	/**
	 * A callback that gets called when the `activeTabId` state changes.
	 */
	onActiveTabIdChange?: Ariakit.TabProviderProps[ 'setActiveId' ];
	/**
	 * Defines the orientation of the tablist and determines which arrow keys
	 * can be used to move focus:
	 *
	 * - `both`: all arrow keys work.
	 * - `horizontal`: only left and right arrow keys work.
	 * - `vertical`: only up and down arrow keys work.
	 *
	 * @default "horizontal"
	 */
	orientation?: Ariakit.TabProviderProps[ 'orientation' ];
};

export type TabListProps = {
	/**
	 * The children elements, which should include one or more instances of the
	 * `Tabs.Tab` component.
	 */
	children: Ariakit.TabListProps[ 'children' ];
};

// TODO: consider prop name changes (tabId, selectedTabId)
// compound technique

export type TabProps = {
	/**
	 * The unique ID of the tab. It will be used to register the tab and match
	 * it to a corresponding `Tabs.TabPanel` component.
	 */
	tabId: NonNullable< Ariakit.TabProps[ 'id' ] >;
	/**
	 * The contents of the tab.
	 */
	children?: Ariakit.TabProps[ 'children' ];
	/**
	 * Determines if the tab should be disabled. Note that disabled tabs can
	 * still be accessed via the keyboard when navigating through the tablist.
	 *
	 * @default false
	 */
	disabled?: Ariakit.TabProps[ 'disabled' ];
	/**
	 * Allows the component to be rendered as a different HTML element or React
	 * component. The value can be a React element or a function that takes in the
	 * original component props and gives back a React element with the props
	 * merged.
	 *
	 * By default, the tab will be rendered as a `button` element.
	 */
	render?: Ariakit.TabProps[ 'render' ];
};

export type TabPanelProps = {
	/**
	 * The contents of the tab panel.
	 */
	children?: Ariakit.TabPanelProps[ 'children' ];
	/**
	 * The unique `id` of the `Tabs.Tab` component controlling this panel. This
	 * connection is used to assign the `aria-labelledby` attribute to the tab
	 * panel and to determine if the tab panel should be visible.
	 *
	 * If not provided, this link is automatically established by matching the
	 * order of `Tabs.Tab` and `Tabs.TabPanel` elements in the DOM.
	 */
	tabId: NonNullable< Ariakit.TabPanelProps[ 'tabId' ] >;
	/**
	 * Determines whether or not the tabpanel element should be focusable.
	 * If `false`, pressing the tab key will skip over the tabpanel, and instead
	 * focus on the first focusable element in the panel (if there is one).
	 *
	 * @default true
	 */
	focusable?: Ariakit.TabPanelProps[ 'focusable' ];
};
