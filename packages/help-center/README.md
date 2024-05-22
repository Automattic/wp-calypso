# Specify query per page/route

In [route-to-query-mapping.json](https://github.com/Automattic/wp-calypso/blob/add/tailored_posts_help_center/packages/help-center/src/route-to-query-mapping.json), there is a JSON structure where you can specify which search query Help Center should use based on the page URL/route.

Example

```
// This will use `home` as a search query when the user navigates to wordpress.com/home
"/home/": "home",
// This will use `new post` as a search query when the user navigates to {site}/wp-admin/post-new.php
"/wp-admin/post-new.php": "new post"
```

## Suggest specific articles per page/route

In [tailored-post-ids-mapping.json](https://github.com/Automattic/wp-calypso/blob/add/tailored_posts_help_center/packages/help-center/src/tailored-post-ids-mapping.json), there is a JSON structure where you can specify which post id ( one or many ) from which blog ( just one blog ) should be displayed

```
// This will fetch posts `"post_ids": [ 248292, 150414 ]` from `"blog_id": 9619154` and display them on `/home`
"/home/": [ { "locale": "en", "post_ids": [ 248292, 150414 ], "blog_id": 9619154 } ],

// This will fetch posts `"post_ids": [  99385, 99879, 99982 ]` from `"blog_id": 33534099` and display them on `{site}/wp-admin/post-new.php`
"/wp-admin/post-new.php": [
		{ "locale": "en", "post_ids": [ 99385, 99879, 99982 ], "blog_id": 33534099 }
	]
```

Tailored articles have priority in the results, meaning they appear on top. If any search query is provided by the user, tailored articles are not considered.
