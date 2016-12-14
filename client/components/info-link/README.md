InfoLink
===========

`InfoLink` shows an `InfoPopover` with an `ExternalLink` inside.

Useful for linking to external help pages from site settings.

`children` will be rendered as children of `ExternalLink`


### `InfoLink` Properties

All props passed to `InfoLink`, except `href` will be passed to `InfoPopover` as props.

#### `href`

The `href` lets you specify the URL the content will be linking to.

### Basic `InfoLink` Usage

```jsx
<InfoLink href={ 'https://jetpack.com/support/photon/' }>
	Learn more about Photon
</InfoLink>
```
