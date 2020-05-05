Analytics: Page Views
=====================

We should record Page views every time the main content body completely changes. This includes both when the browser is refreshed and any time the URL is updated via the browser history API.

These tools will automatically record page views to both Google Analytics and Tracks. The preferred tool is the **`PageViewTracker`** component which is aware of the selected site and, if the current URL contains a site fragment, it will delay the recording of the page view until the selected site is set or updated.

## Usage

### `PageViewTracker`

```js
import PageViewTracker from 'lib/analytics/page-view-tracker';

render() {
	return (
		<Main>
			<PageViewTracker path="/section/page" title="My Cool Section > My Cool Page" />
			<MyCoolComponent>
				<MyCoolChildren />
			</MyCoolComponent>
		</Main>
	);
);
```

For more information about `PageViewTracker`, refer to [its own documentation](https://github.com/Automattic/wp-calypso/tree/master/client/lib/analytics/page-view-tracker).

### `recordPageView( path, title )` action

_Note: Unless you have a strong reason to record a page view with Redux, you should use the `PageViewTracker` component instead._

```js
import { recordPageView } from 'state/analytics/actions';

dispatch( recordPageView( '/section/page', 'My Cool Section > My Cool Page' ) );
```

### `recordPageView( path, title )` method (Deprecated)

_Note: Unless you have a strong reason to directly record a page view, you should use the `PageViewTracker` component instead._

```js
import { recordPageView } from 'lib/analytics/page-view';

recordPageView( '/section/page', 'My Cool Section > My Cool Page' );
```

## Paths Conventions

There are currently no enforced rules for the reporting page views' paths but, where possible, we should normalize them and replace the variables' values with placeholders.

E.g. the path `/comments/all/example.wordpress.com/1234` should be reported as `/comments/all/:site/:post_id`.

As a rule of thumb:

- Report **site fragment** simply as `:site`.
- Report **IDs** as `:element_id` (notice the snake case).
- Report **Non-enumerable, infinite, or unknown variables** (e.g. the domain name in `/domains/manage/:domain/edit/:site`) without unnecessary qualifiers.
- Report the value of **enumerable, finite, or known variables** instead of the placeholder where it makes sense (e.g. if changing the variable value results in a page change, as it happens for the status in `/comments/spam/:site`).

Where possible, hardcode paths without relying on helper functions (e.g. `sectionify( context.path )`) that might result in inconsistent reporting. This will also make the path easier to find in searches.

Some examples of **what to do**:

- `/posts/my/published/:site`
- `/media/images/:site`
- `/comments/all/:site/:post_id`
- `/domains/manage/:domain/transfer/in/:site`
- `/me/purchases/:site/:purchase_id/payment/edit/:card_id`

Some examples of **what not to do**:

- `/posts/my/:status/:site`: record different statuses separately.
- `/media/images/:siteSlug`: always report the site fragment as `:site`.
- `/comments/all/:site/1234`: the post ID is over-specific and results in an incorrect categorization of the path.
- `/domains/manage/www.example.com/transfer/in/:site`: the domain is as over-specific as the post ID in the previous example.
- `/me/purchases/:site/:purchase/payment/edit/:cardId`: the purchase is an ID, so report it as `:purchase_id`; also, always write placeholders in snake-case, so report the card ID as `:card_id`.

## Titles Conventions

Titles should always use a `>` to break up the hierarchy of the page title.

Some examples:

- `Posts > My > Drafts`
- `Reader > Following > Edit`
- `Sharing > Connections`
