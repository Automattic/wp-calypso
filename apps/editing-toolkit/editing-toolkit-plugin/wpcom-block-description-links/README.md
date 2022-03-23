# Block Description Links

## Summary

This adds a "Learn more" link inline with the Block Description.

## Adding more

To extend this to more blocks you must add the block name to the switch case found in `./src/index.ts`. The case should set the `settings.description` using the `inlineBlockDescriptionLink` and break, it should not be returned. Please notice they are segregated as Core, Jetpack, and A8C.

## Example

```javasctipt
case 'core/social-links':
	settings[ 'description' ] = inlineBlockDescriptionLink(
		settings[ 'description' ],
		'https://wordpress.com/support/wordpress-editor/blocks/social-links-block/'
	);
	break;
```
