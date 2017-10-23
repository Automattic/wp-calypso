Sites
======

This is the sites React component that renders the grid of sites in `/sites`. It includes a Site child component with its own jsx file. Placeholders are rendered based on the `visible_site_count` attribute of the user object while the sites are actually being fetched.

### sites.jsx

The sites-list view component and puts together the various filters.

### site.jsx

Handles the single site view. It can be used by any compoenent that needs to render a site card by passing a `site` property object of a single site from sites-list.

```javascript
var Site = require( 'my-sites/sites/site' );

const Component = React.createClass({
  render: function() {
    return (
      <Site site={ site } />
    );
  }
)};
```
