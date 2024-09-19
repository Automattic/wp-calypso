# Command Palette

The Command Palette is a UI element that displays a searchable list of commands. It can be accessed in WordPress.com using the shortcut `cmd+k`.

This command palette is inspired by [Core's implementation](https://github.com/WordPress/gutenberg/blob/trunk/packages/commands/README.md) used in the Gutenberg editor. We use the same CSS and similar markup, the commands share the same basic props that we extended to support the following differences:

- The WordPress.com version supports multisite commands with the sites as second step commands.
- Users can go back to root commands with the `esc` and `backspace` keys, or the back button.
- We change the search placeholder to inform the user about the current command.
- In addition to icons, we also support images for the commands.
- We support two lines of text for the commands.

These differences were highlighted in <https://github.com/WordPress/gutenberg/issues/55514>. We can replace our command palette with the Core one, once we can use all these differences.

## Add a command

In order to add a new command to the palette, you can include the command object in `useCommands` or create a new hook and include it to `useCommandPalette` hooks.

### Command properties

Every command has a set of properties that can be used to customize its behavior. The following properties are available:

- `name`: Type `string`, used as identifier for the command. It's expected to be unique and `camelCase`. It's not visible for the user.
- `label`: Type `string`, used as the label for the command. Visible in the command palette.
- `subLabel`?: Type `string`, used as a second line for the command. Visible in the command palette.
- `searchLabel`?: Type `string`, used to match the user search. It's not visible for the user. We recommend adding keywords related to the command, and using `_x()` to add context to the translators.
- `callback`: Type `function`, used to execute the command when the user clicks on it or presses enter on that command.
- `context`?: Type `string[]`, a list of URL paths for which the command will have priority when displayed. Example: `['/sites', '/manage/domains']`.
- `icon`?: Type `JSX.Element`, used to display an icon for the command. It's visible in the command palette.
- `image`?: Type `JSX.Element`, used to display an image for the command, instead of an icon. It's visible in the command palette.
- `siteSelector`?: Type `boolean`, used to indicate whether the command should display a site selector.
- `siteSelectorLabel`?: Type `string`, used as a placeholder for the search input displayed above the site selector.
- `capability`?: Type `string`, used to indicate the required capability for the command to be available.
- `siteType`?: Type `string`, used to indicate the required site type (Simple, Atomic, Jetpack) for the command to be available.
- `publicOnly`?: Type `boolean`, used to indicate whether the command should be available on public sites only.
- `isCustomDomain`?: Type `boolean`, used to indicate whether the command should be available only on sites with a custom domain.
- `filterP2`?: Type `boolean`, used to indicate whether the command should be excluded from P2 sites.
- `filterStaging`?: Type `boolean`, used to indicate whether the command should be excluded from staging sites.
- `filterSelfHosted`?: Type `boolean`, used to indicate whether the command should be excluded from self-hosted sites.
- `filterNotice`?: Type `string`, used as label shown below the site selector to explain why some sites might not appear.
- `emptyListNotice`?: Type `string`, used as label shown below the site selector to explain why there are no sites available.

### Best practices for defining a command

Please consider carefully before adding a new command to the palette. We aim to avoid incorporating commands that are infrequently used and unlikely to be removed in the future.

- Command labels should be short and descriptive and use sentence case. For example, "Add new site" instead of "Add New Site".
- Commands should start with a verb. For example, "Add new site" instead of "New site".
- Picking the correct verb is important. `Open` is the more generic verb, if the page has a list of elements, we can use `View`, if the user is expected to take an action we can use `Manage` or `Change`. We prefer specific verbs over generic ones.
- We prefer to use [Gutenberg icons](https://wordpress.github.io/gutenberg/?path=/story/icons-icon--library) for root commands. The icon should relate to the object (e.g. "Cache"), not the type of page (e.g. "Settings").
- It's important to keep the same terminology and icons used elsewhere in the interace or in core.
- We can introduce aliases, and keywords using `searchLabel`. For example. "Import a site" would be an alias of "Migrate a site" because the navigation it's under Tools → Import.
- Most commands navigate to other pages. We can also navigate to a specific section/card inside a page. For example, "Manage cache settings" in addition to "Manage hosting configuration".
- Commands that open modals are also allowed. Just be aware that the command palette is visible in most Calypso pages, and we may want to implement an async loading for the modal.

## Usage

Embed the command example. This is already done for all WordPress.com pages in `client/layout/index.jsx` (Calypso) and `apps/command-palette-wp-admin/src/index.js` (WP Admin).

The `CommandPalette` component requires the following properties:

- `navigate`: Type `function`, used to execute the callback of the commands that need to navigate to a different page.
- `currentRoute`: Type `string`, used to indicate the path of the current page.
- `useCommands`: Type `function`, used to return the list of commands to register in the command palette.
- `currentSiteId`: Type `number`, used to indicate the ID of the current site (if any).
- `useSites`: Type `function`, used to return the list of sites to include in the site selector.
- `userCapabilities`: Type `object`, used to indicate the capabilities of the user on all the sites.

```tsx
import CommandPalette, { COMMANDS } from '@automattic/command-palette';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function MyComponent() {
	const navigate = ( url, openInNewTab ) => window.open( url, openInNewTab ? '_blank' : '_self' );
	const currentRoute = window.location.pathname;
	const currentSiteId = useSelector( getSelectedSiteId );
	const userCapabilities = useSelector( ( state ) => state.currentUser.capabilities );

	return <CommandPalette
		navigate={ navigate }
		currentRoute={ currentRoute }
		useCommands={ () => COMMANDS }
		currentSiteId={ siteId }
		useSites={ useSiteExcerptsSorted }
		userCapabilities={ userCapabilities }
	/>;
}
```

Command example:

```
{
	name: 'addNewSite',
	label: __( 'Add new site' ),
	context: [ '/sites' ],
	callback: ( { close }: { close: () => void } ) => {
		close();
		navigate( createSiteUrl );
	},
	icon: addNewSiteIcon,
}
```
