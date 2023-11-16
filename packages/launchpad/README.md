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
            checklistSlug={ checklistSlug }
            launchpadContext='my-app-context' />
    );
}
```

## Props

### siteSlug

The site slug of the site to display the checklist for.

### checklistSlug

The slug of the checklist to display. This is ID of the checklist defined on Jetpack's side. See [Jetpack checklist definitions](https://github.com/Automattic/jetpack/blob/2d37c444fe42eb852f34f1df6c285e94c37e9376/projects/packages/jetpack-mu-wpcom/src/features/launchpad/launchpad.php).

We use the `@automattic/data-stores` package to fetch the checklist data and cache it, through the `useLaunchpad` query.

### launchpadContext

A string that specifies what context we are showing the launchpad in. This will generally identify the page or section of the UI where the launchpad is being displayed.

## LaunchpadInternal

For more complex situations, the `LaunchpadInternal` component is also available, but use of this component is **not recommended**. We should aim to improve the API for the `Launchpad` component first, as the `Launchpad` component wires in a number of non-obvious behaviours that we want to use if at all possible.
