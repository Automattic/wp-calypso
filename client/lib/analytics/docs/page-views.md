Analytics: Page Views
=====================

Page views should be used to record all page views (when the main content body completely changes). This will automatically record the page view to both Google Analytics and Tracks.

The preferred tool to record page views is the **`PageViewTracker`** component which is aware of the selected site and, if the current URL contains a site fragment, it will delay the page view recording until the selected site is set or updated.

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

### `recordPageView( url, title )`

_Note: Unless you have a strong reason to record a page view with Redux, you should use the `PageViewTracker` component instead._

```js
import { recordPageView } from 'state/analytics/actions';

dispatch( recordPageView( url, title ) );
```

### `analytics.pageView.record( url, title )`

_Note: Unless you have a strong reason to directly record a page view, you should use the `PageViewTracker` component instead._

```js
analytics.pageView.record( '/section/page', 'My Cool Section > My Cool Page' );
```

## Paths Conventions

There are currently no enforced rules for page views paths reporting but, where possible, they should be normalized and the variables values replaced by placeholders.

E.g. the path `/comments/all/example.wordpress.com/1234` should be reported as `/comments/all/:site/:post_id`.

As a rule of thumb:

- The **site fragment** should be reported simply as `:site`.
- **IDs** should be reported as `:element_id` (notice the snake case).
- **Non-enumerable, infinite, or unknown variables** (e.g. the domain name in `/domains/manage/:domain/edit/:site`) should be reported without unnecessary qualifiers.
- The value of **enumerable, finite, or known variables** should be reported instead of the placeholder where it make sense (e.g. if changing the variable value results in a page change, as it happens for the status in `/comments/spam/:site`).

Where possible, paths should be set manually, without relying on helper functions (e.g. `sectionify( context.path )`) that might result in inconsistent reporting.

Some examples of **what to do**:

- `/posts/my/published/:site`
- `/media/images/:site`
- `/comments/all/:site/:post_id`
- `/domains/manage/:domain/transfer/in/:site`
- `/me/purchases/:site/:purchase_id/payment/edit/:card_id`

Some examples of **what not to do**:

- `/posts/my/:status/:site`: different statuses should be recorded separately.
- `/media/images/:siteSlug`: the site fragment must be always reported as `:site`.
- `/comments/all/:site/1234`: the post ID is overspecific and results in an incorrect categorization of the path.
- `/domains/manage/www.example.com/transfer/in/:site`: the domain is as overspecific as the post ID in the previous example.
- `/me/purchases/:site/:purchase/payment/edit/:cardId`: the purchase is an ID, so it should be reported as `:purchase_id`; also, placeholders should be always written in snake-case, so the card ID should be reported as `:card_id`.

## Titles Conventions

Titles should always use a `>` to break up the hierarchy of the page title.

Some examples:

- `Posts > My > Drafts`
- `Reader > Following > Edit`
- `Sharing > Connections`
