#Centered Card

This is a card component, which is to be used as a centered element
of the page without the navigation sidebar. An example of its use is the Jetpack
Disconnect Flow, e.g. see `settings/disconnect-site/:site`, where site
is a Jetpack site.

#### How to use:

```js
import CenteredCard from 'my-sites/site-settings/centered-card';

render() {
  return (
      <DisconnectCard>
        { 'Card content' }
      </DisconnectCard>
  );
}
```

## Props

### `header`

### `subheader`

The above supported props are used by the CenteredCard within a `FormattedHeader`
component:
```js
<FormattedHeader
  headerText={ header }
  subHeaderText={ subheader }
/>
```
