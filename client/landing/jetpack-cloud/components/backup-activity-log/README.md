# MissingCredentialsWarning

`<BackupActivityLog />` is a React component for rendering a list of site activities

## Usage

```jsx
import MissingCredentialsWarning from 'client/landing/jetpack-cloud/components/missing-credentials';

export default function MyComponent() {
	return (
		<>
            <BackupActivityLog siteId={ siteId } } />
		</>
	);
}
```

## Props

The following props can be passed to the `<MissingCredentialsWarning />` component:

### `siteId` ( Required )

the id of the site to load activities for

### `baseFilter`
