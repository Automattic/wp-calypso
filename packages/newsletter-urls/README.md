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
subscriber detail panel renders on no other. The panel opens on either id, so `user` works on
its own for a subscriber with no subscription id to hand.

`hasNewsletterSubscribersPage()` answers the other half of the question — whether a site uses the wp-admin page at all, or still manages subscribers on Jetpack Cloud:

```js
import { hasNewsletterSubscribersPage } from '@automattic/newsletter-urls';

hasNewsletterSubscribersPage( { isSelfHostedJetpack, jetpackVersion } );
```

Newsletter > Subscribers shipped in Jetpack 16.1; self-hosted sites below that keep the Jetpack Cloud list, and Simple and Atomic sites always have the wp-admin page. The comparison follows the backend's `version_compare()` on the shapes Jetpack ships, so a prerelease of the minimum (`16.1-beta`) counts as below it.

Callers supply those two facts from wherever they hold site data; the threshold and the comparison live here so they cannot drift apart.
