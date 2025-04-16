# Tabs

<!-- This file is generated automatically and cannot be edited directly. Make edits via TypeScript types and TSDocs. -->

🔒 This component is locked as a [private API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-private-apis/). We do not yet recommend using this outside of the Gutenberg project.

<p class="callout callout-info">See the <a href="https://wordpress.github.io/gutenberg/?path=/docs/components-tabs--docs">WordPress Storybook</a> for more detailed, interactive documentation.</p>

Tabs is a collection of React components that combine to render
an [ARIA-compliant tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

Tabs organizes content across different screens, data sets, and interactions.
It has two sections: a list of tabs, and the view to show when a tab is chosen.

`Tabs` itself is a wrapper component and context provider.
It is responsible for managing the state of the tabs, and rendering one instance of the `Tabs.TabList` component and one or more instances of the `Tab.TabPanel` component.

## Props

### `activeTabId`

 - Type: `string`
 - Required: No

The current active tab `id`. The active tab is the tab element within the
tablist widget that has DOM focus.

- `null` represents the tablist (ie. the base composite element). Users
  will be able to navigate out of it using arrow keys.
- If `activeTabId` is initially set to `null`, the base composite element
  itself will have focus and users will be able to navigate to it using
  arrow keys.

### `children`

 - Type: `ReactNode`
 - Required: Yes

The children elements, which should include one instance of the
`Tabs.Tablist` component and as many instances of the `Tabs.TabPanel`
components as there are `Tabs.Tab` components.

### `defaultTabId`

 - Type: `string`
 - Required: No

The id of the tab whose panel is currently visible.

If left `undefined`, it will be automatically set to the first enabled
tab. If set to `null`, no tab will be selected, and the tablist will be
tabbable.

Note: this prop will be overridden by the `selectedTabId` prop if it is
provided (meaning the component will be used in "controlled" mode).

### `defaultActiveTabId`

 - Type: `string`
 - Required: No

The tab id that should be active by default when the composite widget is
rendered. If `null`, the tablist element itself will have focus
and users will be able to navigate to it using arrow keys. If `undefined`,
the first enabled item will be focused.

Note: this prop will be overridden by the `activeTabId` prop if it is
provided.

### `onSelect`

 - Type: `(selectedId: string) => void`
 - Required: No

The function called when the `selectedTabId` changes.

### `onActiveTabIdChange`

 - Type: `(activeId: string) => void`
 - Required: No

A callback that gets called when the `activeTabId` state changes.

### `orientation`

 - Type: `"horizontal" | "vertical" | "both"`
 - Required: No
 - Default: `"horizontal"`

Defines the orientation of the tablist and determines which arrow keys
can be used to move focus:

- `both`: all arrow keys work.
- `horizontal`: only left and right arrow keys work.
- `vertical`: only up and down arrow keys work.

### `selectOnMove`

 - Type: `boolean`
 - Required: No
 - Default: `true`

Determines if the tab should be selected when it receives focus. If set to
`false`, the tab will only be selected upon clicking, not when using arrow
keys to shift focus (manual tab activation). See the [official W3C docs](https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/)
for more info.

### `selectedTabId`

 - Type: `string`
 - Required: No

The id of the tab whose panel is currently visible.

If left `undefined`, it will be automatically set to the first enabled
tab, and the component assumes it is being used in "uncontrolled" mode.

Consequently, any value different than `undefined` will set the component
in "controlled" mode. When in "controlled" mode, the `null` value will
result in no tabs being selected, and the tablist becoming tabbable.

## Subcomponents

### Tabs.TabList

A wrapper component for the `Tab` components.

It is responsible for rendering the list of tabs.

#### Props

##### `children`

 - Type: `ReactNode`
 - Required: Yes

The children elements, which should include one or more instances of the
`Tabs.Tab` component.

### Tabs.Tab

Renders a single tab.

The currently active tab receives default styling that can be
overridden with CSS targeting `[aria-selected="true"]`.

#### Props

##### `children`

 - Type: `ReactNode`
 - Required: No

The contents of the tab.

##### `disabled`

 - Type: `boolean`
 - Required: No
 - Default: `false`

Determines if the tab should be disabled. Note that disabled tabs can
still be accessed via the keyboard when navigating through the tablist.

##### `render`

 - Type: `RenderProp<HTMLAttributes<any> & { ref?: Ref<any>; }> | ReactElement<any, string | JSXElementConstructor<any>>`
 - Required: No

Allows the component to be rendered as a different HTML element or React
component. The value can be a React element or a function that takes in the
original component props and gives back a React element with the props
merged.

By default, the tab will be rendered as a `button` element.

##### `tabId`

 - Type: `string`
 - Required: Yes

The unique ID of the tab. It will be used to register the tab and match
it to a corresponding `Tabs.TabPanel` component.

### Tabs.TabPanel

Renders the content to display for a single tab once that tab is selected.

#### Props

##### `children`

 - Type: `ReactNode`
 - Required: No

The contents of the tab panel.

##### `focusable`

 - Type: `boolean`
 - Required: No
 - Default: `true`

Determines whether or not the tabpanel element should be focusable.
If `false`, pressing the tab key will skip over the tabpanel, and instead
focus on the first focusable element in the panel (if there is one).

##### `tabId`

 - Type: `string`
 - Required: Yes

The unique `id` of the `Tabs.Tab` component controlling this panel. This
connection is used to assign the `aria-labelledby` attribute to the tab
panel and to determine if the tab panel should be visible.

If not provided, this link is automatically established by matching the
order of `Tabs.Tab` and `Tabs.TabPanel` elements in the DOM.
