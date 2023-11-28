# Command Palette

The Command Palette is a React component used to display a text input used to search and filter a list of commands. It can be accessed in the Calypso using the shortcut `cmd+k`.

The command palette is inspired by [Core](https://github.com/WordPress/gutenberg/blob/trunk/packages/commands/README.md) implementation used in the Gutenberg editor.

## Add a command

In order to add a new command to the palette, you can add it in `useCommandsArrayWpcom` or create a new hook and include it to `useCommandPallette` hooks.

## Command properties

Every command has a set of properties that can be used to customize its behavior. The following properties are available:

- `name`: Type `string`, used as identifier for the command. It's ex
- `label`: Type `string`, used as the label for the command. Visible in the command palette.
- `subLabel`?: Type `string`, used as a second line for the command. Visible in the command palette.
- `searchLabel`?: Type `string`, used to match the user search. It's not visible for the user. We recommend to use `_x()` to add context to the translators.
- `callback`: Type `function`, used to execute the command when the user clicks on it or press enter on that command.
- `context`?: Type `string[]`, a list of paths used to display the command by default.
- `icon`?: Type `JSX.Element`, used to display an icon for the command. It's visible in the command palette.
- `image`?: Type `JSX.Element`, used to display an image for the command, instead of an icon. It's visible in the command palette.
- `siteFunctions`?: Type `SiteFunctions`, used for nested commands that need to execute a function when a site is selected in the command palette as a second step.

## Usage

```jsx
import { WpcomCommandPalette } from 'calypso/components/command-pallette/wpcom-command-pallette';

export default function MyComponent() {
	return <WpcomCommandPalette />;
}
```
