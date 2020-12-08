# Query Site Segments

`<QuerySegments />` is a React component used to fire a network request for the `/segments` endpoint, which returns site segment information for signup.

Because it's static data from the server, it will only fire if there are no segments data in the state tree.

## Usage

Render the component. It accepts neither props or children, nor does it render any elements to the page.

```js
import QuerySegments from 'calypso/components/data/query-segments';
import { getSegments } from 'calypso/state/signup/segments/selectors';

class MyComponent extends React.Component {
	render() {
		const { segments } = this.props;

		return (
			<div>
				<QuerySegments />
				<ul>
					{ segments.length &&
						segments.map( ( segment ) => {
							return <li>{ segment.id }</li>;
						} ) }
				</ul>
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	segments: getSegments( state ),
} ) )( MyComponent );
```
