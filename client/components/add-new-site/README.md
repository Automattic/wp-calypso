# AddNewSite

This is a [`AddNewSite` component](../../components/add-new-site/index.tsx)

## Overview

The [AddNewSite](../../components/add-new-site/index.tsx) component is designed with a focus on modularity and environment agnosticism. Our approach centralizes component functionality to ensure a single implementation serves all environments. Environment-specific behaviors are managed internally using the environment the component is rendered in, keeping the component adaptable and reusable across different contexts. Additionally, the component leverages asynchronous loading for dynamic content, ensuring that environment-specific data is fetched and rendered only when needed. This strategy optimizes performance and guarantees the most relevant data is presented to the user. For more details, refer to [PR #97499](https://github.com/Automattic/wp-calypso/pull/97499).

## Usage

```jsx
import React from 'react';
import AddNewSite from 'calypso/components/add-new-site';

const App = () => {
	return <AddNewSite />;
};

export default App;
```

## Props

The Add New Site component does not accept any props.

## Components

The Add New Site component is composed of several subcomponents:

- [AddNewSiteButton](../../components/add-new-site/button.tsx): Renders the button to open the "Add New Site" menu.

- [AddNewSitePopover](../../components/add-new-site/popover.tsx): Renders the popover menu

- [AddNewSitePopoverColumn](../../components/add-new-site/popover-column.tsx): Renders the flex column for the popover menu

- [AddNewSiteMenuItem](../../components/add-new-site/menu-item.tsx): Renders the menu item within the popover.

## Context

The Add New Site component uses the AddNewSiteContext to manage the state of the modal type and visibility. The context provides the following values:

| Value               | Type     | Description                             |
| ------------------- | -------- | --------------------------------------- |
| visibleModalType    | string   | The type of the currently visible modal |
| setVisibleModalType | function | Function to set the visible modal type  |

## Async Loading

The [AddNewSite](../../components/add-new-site/index.tsx) component utilizes asynchronous loading to fetch and render content dynamically via the [AddNewSiteContent](../../components/add-new-site/content/index.tsx) component. This approach ensures that environment-specific data is loaded and displayed appropriately. It is essential to always implement asynchronous loading to:

- Optimize performance by fetching data only when required.
- Ensure that environment-specific content is accurate and up-to-date.

By adhering to this practice, the [AddNewSite](../../components/add-new-site/index.tsx) component remains both efficient and versatile in various deployment contexts.
