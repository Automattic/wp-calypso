# ApiFetch Handling

There are some things that Gutenberg fetches from the REST api to make blocks work. By default this uses the site URL rather than the public-api. In order to handle this we define a custom fetch handler that utilizes `wpcomFetch` depending on the path. Otherwise we return the default fetch handler.

## Default Fetch Handler

Gutenberg gives us the ability to set a custom fetch handler but does not offer a way to return the default handler in the event we want to return that. For this reason we have copied the logic from Gutenberg and put it into `./default.ts`. This can be removed if Gutenberg updates the package to export the default handler which it currently does not.

## Embeds

The main reason this API middleware exists is for embeds. Embeds use the oembed/proxy endpoint from core which requires an authenticated user with permission to edit posts. Our middleware catches the request and forwards it through wpcomFetch along with a nonce to prevent abuse.
