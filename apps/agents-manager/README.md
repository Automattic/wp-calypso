# Agents Manager App

The Agents Manager app provides a standalone application for loading the Unified AI Agent component.

## Development

TBD

### How to debug the Agents Manager

#### In Calypso

Follow the classic Calypso development setup. Run `yarn start` and edit away. Nothing else should be needed.

#### In Simple sites

1. cd into `apps/agents-manager`.
2. run `yarn dev --sync`.
3. Sandbox your site and `widgets.wp.com`.
4. Your changes should be reflected on the site live.

#### In Atomic sites

If you only interested in making JS and CSS changes, you're in luck; you don't need to worry about running Jetpack. You can follow the same instructions of simple sites.

> [!IMPORTANT]
> If you make changes to the \*.asset.json files, i.e add or remove dependencies, these files won't be synced with the site as Jetpack pulls these files via network. And since Jetpack pulls from production and not your sandbox, you'll have to deploy first for these changes to take effect.

If you do want to modify PHP files. Please follow the development process of [`jetpack-mu-plugin`](https://github.com/Automattic/jetpack/blob/trunk/projects/packages/jetpack-mu-wpcom/README.md).

### Data Structure

TBD

### Translations

Translations are uploaded to widgets.wp.com/agents-manager/languages. They're then downloaded in Jetpack during the build process.



