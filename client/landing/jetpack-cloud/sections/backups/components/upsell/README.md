# BackupUpsell

`<BackupUpsell />` is a React component for rendering an Upsell in cases where the site does not have a plan with Backup support

## Usage

```jsx
import BackupUpsell from 'client/landing/jetpack-cloud/sections/backup/components/upsell';

export default function MyComponent() {
	return (
		<>
			{ this.props.hasFreePlan && (
				<BackupUpsell siteSlug={ siteSlug } } />
			) }
		</>
	);
}
```

## Props

The following props can be passed to the `<BackupUpsell />` component:

### `siteSlug` ( Required )

siteSlug to use in constructing the "Upgrade" link of the upsell. This allows the link to go directly to the page for the site.
