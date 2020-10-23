# Query SiteDomains

`<QuerySiteDomains />` is a React component used in managing network requests for sites/%s/domains.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page.

```jsx
import QuerySiteDomains from 'calypso/components/data/query-site-domains';

class MyComponent extends React.Component {
	render() {
		const { site, domains } = this.props;

		return (
			<div>
				<QuerySiteDomains siteId={ site.ID } />
				<ul>
					{ domains.map( ( domain ) => {
						return <li>{ domain.domain }</li>;
					} ) }
				</ul>
			</div>
		);
	}
}
```
