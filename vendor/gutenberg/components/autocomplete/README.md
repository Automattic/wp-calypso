Autocomplete
============

This component is used to provide autocompletion support for a child input component.

## Autocompleters

Autocompleters enable us to offer users options for completing text input. For example, Gutenberg includes a user autocompleter that provides a list of user names and completes a selection with a user mention like `@mary`.

Each completer declares:

* Its name.
* The text prefix that should trigger the display of completion options.
* Raw option data.
* How to render an option's label.
* An option's keywords, words that will be used to match an option with user input.
* What the completion of an option looks like, including whether it should be inserted in the text or used to replace the current block.

In addition, a completer may optionally declare:

* A class name to be applied to the completion menu.
* Whether it should apply to a specified text node.
* Whether the completer applies in a given context, defined via a Range before and a Range after the autocompletion trigger and query.

### The Completer Interface

#### name

The name of the completer. Useful for identifying a specific completer to be overridden via extensibility hooks.

- Type: `String`
- Required: Yes

#### options

The raw options for completion. May be an array, a function that returns an array, or a function that returns a promise for an array.

Options may be of any type or shape. The completer declares how those options are rendered and what their completions should be when selected.

- Type: `Array|Function`
- Required: Yes

#### triggerPrefix

The string prefix that should trigger the completer. For example, Gutenberg's block completer is triggered when the '/' character is entered.

- Type: `String`
- Required: Yes

#### getOptionLabel

A function that returns the label for a given option. A label may be a string or a mixed array of strings, elements, and components.

- Type: `Function`
- Required: Yes

#### getOptionKeywords

A function that returns the keywords for the specified option.

- Type: `Function`
- Required: No

#### isOptionDisabled

A function that returns whether or not the specified option should be disabled. Disabled options cannot be selected.

- Type: `Function`
- Required: No

#### getOptionCompletion

A function that takes an option and responds with how the option should be completed. By default, the result is a value to be inserted in the text. However, a completer may explicitly declare how a completion should be treated by returning an object with `action` and `value` properties. The `action` declares what should be done with the `value`.

There are currently two supported actions:

* "insert-at-caret" - Insert the `value` into the text (the default completion action).
* "replace" - Replace the current block with the block specified in the `value` property.

#### allowNode

A function that takes a text node and returns a boolean indicating whether the completer should be considered for that node.

- Type: `Function`
- Required: No

#### allowContext

A function that takes a Range before and a Range after the autocomplete trigger and query text and returns a boolean indicating whether the completer should be considered for that context.

- Type: `Function`
- Required: No

#### className

A class name to apply to the autocompletion popup menu.

- Type: `String`
- Required: No

#### isDebounced

Whether to apply debouncing for the autocompleter. Set to true to enable debouncing.

- Type: `Boolean`
- Required: No

### Examples

The following is a contrived completer for fresh fruit.

```jsx
const fruitCompleter = {
	name: 'fruit',
	// The prefix that triggers this completer
	triggerPrefix: '~',
	// The option data
	options: [
		{ visual: '🍎', name: 'Apple' },
		{ visual: '🍊', name: 'Orange' },
		{ visual: '🍇', name: 'Grapes' },
	],
	// Returns a label for an option like "🍊 Orange"
	getOptionLabel: option => [
		<span class="icon">{ option.visual }</span>,
		option.name
	],
	// Declares that options should be matched by their name
	getOptionKeywords: option => [ option.name ],
	// Declares that the Grapes option is disabled
	isOptionDisabled: option => option.name === 'Grapes',
	// Declares completions should be inserted as abbreviations
	getOptionCompletion: option => (
		<abbr title={ option.name }>{ option.visual }</abbr>
	),
};
```
