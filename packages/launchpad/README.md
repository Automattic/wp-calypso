# Launchpad

Launchpad is the base component for displaying a checklist in the WordPress.com dashboard. It handles fetching the checklist data and displaying the checklist.

## Usage

First, import the Launchpad component:

```js
import { Launchpad } from '@automattic/launchpad'
```

Then, use it in your code:

```js
function App( { siteSlug, checklistSlug } ) {
    return (
        <Launchpad
            siteSlug={ siteSlug }
            checklistSlug={ checklistSlug } />
    );
}
```

## Props

### siteSlug

The site slug of the site to display the checklist for.

### checklistSlug

Optional slug of the checklist to display. If not provided, we use the site intent to determine which checklist to display.
