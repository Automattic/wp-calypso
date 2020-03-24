# MissingCredentialsWarning

`<MissingCredentialsWarning />` is a React component for rendering a warning that backup credentials are missing

## Usage

```jsx
import MissingCredentialsWarning from 'client/landing/jetpack-cloud/components/missing-credentials';

export default function MyComponent() {
	return (
		<>
			{ this.props.credentialsMissing && (
				<MissingCredentialsWarning settingsLink={ `/settings/${ siteSlug }` } />
			) }
		</>
	);
}
```

## Props

The following props can be passed to the `<MissingCredentialsWarning />` component:

### `settingsLink`

string to set as the link for the "Enter your server credentials" button
