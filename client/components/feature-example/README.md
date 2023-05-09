# Feature Example

Feature Example is a component used to render an mocked example of any feature. It renders whatever children it receives. The example is covered by a layer of fading gradient that gives the user a sense of UI that they are missing.

## Usage

```jsx
import EmptyContent from 'calypso/components/empty-content';
import FeatureExample from 'calypso/components/feature-example';

function MyComponent() {
	return (
		<FeatureExample>
			<EmptyContent />
		</FeatureExample>
	);
}
```
