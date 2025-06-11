import { Tabs } from '@base-ui-components/react/tabs';

export type TabsProps = {
	/**
	 * The children elements, which should include one instance of the
	 * `Tabs.Tablist` component and as many instances of the `Tabs.TabPanel`
	 * components as there are `Tabs.Tab` components.
	 */
	children: Tabs.Root.Props[ 'children' ];
	/**
	 * The value of the currently selected Tab.
	 * Use when the component is controlled. When the value is null,
	 * no Tab will be selected.
	 */
	value?: Tabs.Root.Props[ 'value' ];
	/**
	 * The default value.
	 * Use when the component is not controlled. When the value is null,
	 * no Tab will be selected.
	 */
	defaultValue?: Tabs.Root.Props[ 'defaultValue' ];
	/**
	 * Callback invoked when new value is being set.
	 */
	onValueChange?: Tabs.Root.Props[ 'onValueChange' ];
	/**
	 * The component orientation (layout flow direction).d down arrow keys work.
	 * @default "horizontal"
	 */
	orientation?: Tabs.Root.Props[ 'orientation' ];
	/**
	 * Allows you to replace the component’s HTML element with a different tag,
	 * or compose it with another component.
	 * Accepts a ReactElement or a function that returns the element to render.
	 *
	 * By default, the tabs root will be rendered as a `div` element.
	 */
	render?: Tabs.Root.Props[ 'render' ];
};

export type TabListProps = {
	/**
	 * The children elements, which should include one or more instances of the
	 * `Tabs.Tab` component.
	 */
	children: Tabs.List.Props[ 'children' ];
	/**
	 * Whether to automatically change the active tab on arrow key focus.
	 * Otherwise, tabs will be activated using Enter or Spacebar key press.
	 * @default true
	 */
	activateOnFocus?: Tabs.List.Props[ 'activateOnFocus' ];
	/**
	 * Whether to loop keyboard focus back to the first item when the end of
	 * the list is reached while using the arrow keys.
	 * @default false
	 */
	loop?: Tabs.List.Props[ 'loop' ];
	/**
	 * Allows you to replace the component’s HTML element with a different tag,
	 * or compose it with another component.
	 * Accepts a ReactElement or a function that returns the element to render.
	 *
	 * By default, the tablist will be rendered as a `div` element.
	 */
	render?: Tabs.List.Props[ 'render' ];
	/**
	 * The visual density of the tab list.
	 * @default "default"
	 */
	density?: 'compact' | 'default';
};

export type TabProps = {
	/**
	 * The value of the Tab. When not specified,
	 * the value is the child position index.
	 */
	value?: Tabs.Tab.Props[ 'value' ];
	/**
	 * The contents of the tab.
	 */
	children?: Tabs.Tab.Props[ 'children' ];
	/**
	 * Allows you to replace the component’s HTML element with a different tag,
	 * or compose it with another component.
	 * Accepts a ReactElement or a function that returns the element to render.
	 *
	 * By default, the tab will be rendered as a `button` element.
	 */
	render?: Tabs.Tab.Props[ 'render' ];
};

export type TabPanelProps = {
	/**
	 * The contents of the tab panel.
	 */
	children?: Tabs.Panel.Props[ 'children' ];
	/**
	 * The value of the TabPanel.
	 * It will be shown when the Tab with the corresponding value is selected.
	 * If not provided, it will fall back to the index of the panel.
	 * It is recommended to explicitly provide it, as it's required for the tab
	 * panel to be rendered on the server.
	 */
	value?: Tabs.Panel.Props[ 'value' ];
	/**
	 * Whether to keep the HTML element in the DOM while the panel is hidden.
	 * @default false
	 */
	keepMounted?: Tabs.Panel.Props[ 'keepMounted' ];
	/**
	 * Allows you to replace the component’s HTML element with a different tag,
	 * or compose it with another component.
	 * Accepts a ReactElement or a function that returns the element to render.
	 *
	 * By default, the tab panel will be rendered as a `div` element.
	 */
	render?: Tabs.Panel.Props[ 'render' ];
	/**
	 * Whether the tab panel should be focusable.
	 * @default true
	 */
	focusable?: boolean;
};
