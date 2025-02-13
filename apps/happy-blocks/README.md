# Happy blocks

This package contains the source code for the blocks used on WordPress.com sites such as [Forums](https://wordpress.com/forums) and [Support](https://wordpress.com/support). These blocks are not registered for users and should not be registered to all of WordPress.com.

## Development environment

1. Ensure you have a working sandbox and the its hostname is `wpcom-sandbox`
2. Run `yarn dev --sync` to build and sync files as you change them.

## Deployment

1. Deploy the entire Calypso project following the usual deployment process.
2. Deploy happy blocks to wpcom using the install-plugin.sh script in a wpcom sandbox.
```
# Prep the latest trunk build for release
install-plugin.sh happy-blocks --release
# Alternatively, load changes from a branch (e.g. to test a PR.)
install-plugin.sh happy-blocks $brach_name
```

see PCYsg-OT6-p2

## Blocks

### Pricing Plan

[ Needs documentation ]

### Universal Header

This is a block version of the unified WordPress.com header. It should match the current version at WordPress.com homepage (logged out) for continuity as users browse arounf all our sites. The block is built from `@automattic/wpcom-template-parts`. You can see this in action on [Forums](https://wordpress.com/forums) and [Support](https://wordpress.com/support).
