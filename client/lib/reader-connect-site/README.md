# Reader Connect Site

This is a HoC that takes in a component and wraps it with one that knows how to fetch sites and feeds.
The output component expects to be handed either a feedId or a siteId. It will only initiate network requests if the feed/site is not already part of the state tree.

## Example

```js
import connectSite from 'calypso/lib/reader-connect-site';

const SiteInfo = () => {
	if ( ! this.props.site ) {
		return null;
	}
	const { title, url, description } = this.props.site;
	return (
		<>
			<h1> Site Info! </h1>
			<p> title: { title }</p>
			<p> url: { url }</p>
			<p> title: { description }</p>
		</>
	);
};

const ConnectedSiteInfo = connectSite( SiteInfo );
<ConnectedSiteInfo siteId="12345" />;
```
