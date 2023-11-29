# Command Palette

The Command Palette is a React component used to display a text input used to search and filter a list of commands. It can be accessed in the Calypso using the shortcut `cmd+k`.

The command palette is inspired by [Core](https://github.com/WordPress/gutenberg/blob/trunk/packages/commands/README.md) implementation used in the Gutenberg editor. We use the same CSS and similar markup, the commands share the same basic props that we extended to support the following differences:

- The Calypso version supports multisite commands with the sites as second step commands.
- Users can go back to root commands with the `esc` and `backspace` keys, or the back button.
- We change the search placeholder to inform the user about the current command.
- Besides of icons, we also support images for the commands.
- We support two lines of text for the commands.

## Add a command

In order to add a new command to the palette, you can include the command object in `useCommandsArrayWpcom` or create a new hook and include it to `useCommandPallette` hooks.

## Command properties

Every command has a set of properties that can be used to customize its behavior. The following properties are available:

- `name`: Type `string`, used as identifier for the command. It's expected to be unique and `camelCase`. It's not visible for the user.
- `label`: Type `string`, used as the label for the command. Visible in the command palette.
- `subLabel`?: Type `string`, used as a second line for the command. Visible in the command palette.
- `searchLabel`?: Type `string`, used to match the user search. It's not visible for the user. We recommend to use `_x()` to add context to the translators.
- `callback`: Type `function`, used to execute the command when the user clicks on it or presses enter on that command.
- `context`?: Type `string[]`, a list of URL paths for which the command will have priority when displayed.
- `icon`?: Type `JSX.Element`, used to display an icon for the command. It's visible in the command palette.
- `image`?: Type `JSX.Element`, used to display an image for the command, instead of an icon. It's visible in the command palette.
- `siteFunctions`?: Type `object`, used for nested commands that need to execute a function when a site is selected in the command palette as a second step.

## Best practices for defining a command

Please consider carefully before adding a new command to the palette. We aim to avoid incorporating commands that are infrequently used and unlikely to be removed in the future.

- Command labels should be short and descriptive and use sentence case. For example, "Add new site" instead of "Add New Site".
- Commands should start with a verb. For example, "Add new site" instead of "New site".
- Picking the correct verb is important. `Open` is the more generic verb, if the page has a list of elements, we can use `View`, if the user is expected to take an action we can use `Manage` or `Change`. We prefer specific verbs over generic ones.
- Most commands navigate to other pages. We can also navigate to a specific section/card inside a page. For example, "Manage cache settings" in addition to "Manage hosting configuration".
- Commands that open modals are also allowed. Just be aware that the command palette is visible in most Calypso pages.
- We prefer to use [Gutenberg icons](https://wordpress.github.io/gutenberg/?path=/story/icons-icon--library) for root commands.

## Usage

Embed the command example. This is already done for all WPcom calypso pages using `client/layout/index.jsx`.

```tsx
import { WpcomCommandPalette } from 'calypso/components/command-pallette/wpcom-command-pallette';

export default function MyComponent() {
	return <WpcomCommandPalette />;
}
```

Command example:

```tsx
{
	name: 'addNewSite',
	label: __( 'Add new site' ),
	context: [ '/sites' ],
	callback: ( { close }: { close: () => void } ) => {
		close();
		navigate( createSiteUrl );
	},
	icon: addNewSiteIcon,
},

```
