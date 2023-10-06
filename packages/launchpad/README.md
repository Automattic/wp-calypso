# Launchpad

Launchpad is the base component for displaying a checklist in the WordPress.com dashboard. It handles fetching the checklist data and displaying the checklist.

## Usage

First, import the Launchpad component:

```js
import { Launchpad } from '@automattic/launchpad'
```

Then, use it in your code:

```js
function App( { siteSlug, checklistSlug, context } ) {
    return (
        <Launchpad
            siteSlug={ siteSlug }
            checklistSlug={ checklistSlug }
            context={ context } />
    );
}
```

## Props

### siteSlug

The site slug of the site to display the checklist for.

### checklistSlug

Optional slug of the checklist to display. This is ID of the checklist defined on Jetpack's side. See [Jetpack checklist definitions](https://github.com/Automattic/jetpack/blob/2d37c444fe42eb852f34f1df6c285e94c37e9376/projects/packages/jetpack-mu-wpcom/src/features/launchpad/launchpad.php).

We use the `@automattic/data-stores` package to fetch the checklist data and cache it, through the `useLaunchpad` query.
