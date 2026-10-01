# Newsletter URLs

Builders for the wp-admin Newsletter page (`admin.php?page=jetpack-newsletter`).

The page is a router, and wp-admin already owns the query string, so the router reads its own
route and search from a single `p` parameter — a top-level `tab` is ignored. Which tab opens
when none is named follows whichever tabs are enabled, so links state the tab they want.

```js
import { newsletterAdminUrl } from '@automattic/newsletter-urls';

newsletterAdminUrl( adminUrl, { tab: 'subscribers' } );
newsletterAdminUrl( adminUrl, { tab: 'subscribers', subscriber: 944012532, user: 266514373 } );
newsletterAdminUrl( adminUrl, { tab: 'settings' } );

// For a link that means the Newsletter section rather than one of its tabs.
newsletterAdminUrl( adminUrl, { tab: 'default' } );
```

`tab` is required so that landing on whichever tab happens to be first is a decision rather
than an oversight. `subscriber` and `user` are accepted only on the Subscribers tab, since the
subscriber detail panel renders on no other.

This package builds strings and knows nothing about sites. Deciding *whether* a site uses the
wp-admin page at all — a self-hosted Jetpack below 16.1 manages subscribers on Jetpack Cloud —
belongs to the caller.
