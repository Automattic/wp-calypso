Embeds
------

Flux store and actions for retrieving an embed's render output from the [`GET /sites/$site/embeds/render`](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/embeds/render/) and [`GET /sites/$site/embeds/`](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/embeds/) REST API endpoints.

## Usage

A single action is made available, `fetch`, which accepts a site ID and an optional embed URL to be rendered. If the embed URL is omitted, a request is instead made to retrieve the available embeds for the site. Each of the two stores are modeled as [Flux Utils `ReduceStore`](https://facebook.github.io/flux/docs/flux-utils.html#reducestore-t), which can be subscribed to directly, or wrapped with a container view component using [Flux Utils `Container.create`](https://facebook.github.io/flux/docs/flux-utils.html#container).

## Stores

### [`PostEditEmbedsStore`](./store.js)

A simple object mapping URLs to embed results, tracking site per the session of editing a post in the post editor.

```js
var embed = PostEditEmbedsStore.get( 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' );
console.log( embed.result );
// => "<iframe width=\"459\" height=\"344\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed\" frameborder=\"0\" allowfullscreen></iframe>"
```

### [`EmbedsListStore`](./list-store.js)

Tracks all of the supported embeds for a particular site.

```js
var siteEmbeds = EmbedsListStore.get( 77203074 );
console.log( siteEmbeds.embeds );
// => { embeds: [ "#https?:\/\/(www\\.)?flickr\\.com\/.*#i", "#https?:\/\/vine.co\/v\/([a-z0-9]+).*#i" ] }
```
