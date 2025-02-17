# The Newsletter Widget

This standalone app is used to render the newsletter widget in Jetpack and  WordPress.com.


## Building

### Production

```
cd apps/newsletter
yarn build
```

### Development

- CD into the `apps/newsletter` directory
- Run `yarn dev --sync` to start the development server and rsync the changes to your WPCOM Sandbox.

## Uploading to CDN

The path is `widgets.wp.com/newsletter`.