# Help Center

<kbd><img width="417" alt="image" src="https://github.com/Automattic/wp-calypso/assets/17054134/05e99f88-59ea-4303-889c-bd6b9cc52ce7"></kbd>

The Help Center is the main tool our customers use to reach for support.

## Development

The Help Center is a bit complicated because it runs in multiple different environments.

1. In Calypso.
2. In Simple sites
   - as a plugin to Gutenberg editor.
   - as a wpadminbar menu item.
3. In Atomic sites
   - as a plugin to Gutenberg editor.
     - A plugin when the site is connected to Jetpack.
     - A minimal plugin when the site is disconnected from Jetpack. This plugiy simple links to wp.com/help.
   - as a wpadminbar menu item.
     - A menu item that opens the Help Center when connected to Jetpack.
     - A minimal plugin when the site is disconnected from Jetpack. This plugiy simple links to wp.com/help.

### How to debug the Help Center

#### In Calypso

Follow the classic Calypso development setup. Run `yarn start` and edit away. Nothing else should be needed.

#### In Simple sites

1. cd into `apps/help-center`.
2. run `yarn dev --sync`.
3. Sandbox your site and `widgets.wp.com`.
4. Your changes should be reflected on the site live.

#### In Atomic sites

If you only interested in making JS and CSS changes, you're in luck; you don't need to worry about running Jetpack. You can follow the same instructions of simple sites.

> [!IMPORTANT]
> If you make changes to the \*.asset.json files, i.e add or remove dependencies, these files won't be synced with the site as Jetpack pulls these files via network. And since Jetpack pulls from production and not your sandbox, you'll have to deploy first for these changes to take effect.

If you do want to modify PHP files. Please follow the development process of [`jetpack-mu-plugin`](https://github.com/Automattic/jetpack/blob/trunk/projects/packages/jetpack-mu-wpcom/README.md).

### Translations

Translation are uploaded to widgets.wp.com/help-center/languages. They're then downloaded in Jetpack during the build process.

### Deployment

After every change to the Help Center, the development process is two parts:

#### Deploy Calypso

This simply means deploying Calypso as you normally would.

#### Deploy the Help Center for Jetpack consumption

1. cd into `apps/help-center`.
2. run `yarn build --sync`.
3. Create a patch from the changes on your sandbox.
4. Deploy wpcom.

This will deploy the Help Center app for Jetpack consumption. Along with the languages files.

> [!IMPORTANT]
> If you add new phrases to the Help Center. They will only be translated in Atomic sites after `jetpack-mu-plugin` is released. Which happens twice a day.

## Contextualized Support articles

### Specify query per page/route

In [route-to-query-mapping.json](https://github.com/Automattic/wp-calypso/blob/add/tailored_posts_help_center/packages/help-center/src/route-to-query-mapping.json), there is a JSON structure where you can specify which search query Help Center should use based on the page URL/route.

Example

```
// This will use `home` as a search query when the user navigates to wordpress.com/home
"/home/": "home",
// This will use `new post` as a search query when the user navigates to {site}/wp-admin/post-new.php
"/wp-admin/post-new.php": "new post"
```

### Suggest specific articles per page/route

When you open the Help Center, a call to /help/search is made.
We can pass a `section` parameter to the search query, and it will fetch posts tailored from that section on the backend, on the `WPCOM_Help_Search` class.
If needed, add a new section there, with a list of post ids.

Tailored articles have priority in the results, meaning they appear on top. If any search query is provided by the user, tailored articles are not considered.
