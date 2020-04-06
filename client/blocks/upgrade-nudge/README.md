# Upgrade Nudge

UpgradeNudge is a visual "nudge" which encourages users to upgrade their plan for a site, usually by offering a new feature that is part of the upgraded plan. It indicates the name of the plan that the user can upgrade to, and displays a simple message describing the benefits or a feature of upgrading to that plan.

## Usage

```jsx
import UpgradeNudge from 'blocks/upgrade-nudge';

export default function ShowUpgradeNudge() {
	return (
		<div>
			<UpgradeNudge
				title="This is a title"
				message="This is a custom message"
			/>
		</div>
	);
}
```

## Props

Name | Type | Default | Description
--- | --- | --- | ---
`className` | `string` | `null` | An additional `className` for the Card (or Button if compact) component inside the UpgradeNudge.
`compact` | `bool` | `false` | Decreases the size of the UpgradeNudge.
`event` | `string` | `null` | An event to distinguish the nudge in tracks. Will be set as the `cta_name` event property.
`feature` | `string` from `FEATURES_LIST` keys | `null` | The slug of the feature that will be provided as part of the proposed upgrade.
`forceDisplay` | `bool` | `false` | Used to display the update nudge in devdocs.
`href` | `string` | `null` | The URL/path that the UpgradeNudge redirects to if clicked.
`icon` | `string` | `'star'` | The slug of the icon used on the UpgradeNudge.
`jetpack` | `bool` | `false` | Indicates whether the proposed upgrade feature is a Jetpack feature.
`message` | `string` | `'And you get your own domain address.'` | The displayed message on the UpgradeNudge.
`onClick` | `func` | `noop` | The function to run when the UpgradeNudge is clicked.
`plan` | `string` from `PLANS_LIST` keys | `null` | The slug of the plan that the proposed upgrade would provide.
`site` | `object` | `null` | The site that is proposed to be upgraded.
`title` | `string` | `'Upgrade to Premium'` | The displayed title on the UpgradeNudge.
`translate` | `func` | `identity` | The translation function to use for translatable strings visible on the UpgradeNudge.

# Additional usage information

* **feature**: See `client/lib/plans/constants.js` for `FEATURES_LIST`.
* **plan**: See `client/lib/plans/constants.js` for `PLANS_LIST`.
