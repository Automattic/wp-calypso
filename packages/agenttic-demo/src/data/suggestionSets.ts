import type { Suggestion } from '@automattic/agenttic-ui';

export type SuggestionContext =
	| 'button'
	| 'heading'
	| 'image'
	| 'pattern'
	| 'none';

/**
 * Context-specific suggestion sets used by the Embedded and Compact demos to
 * simulate the selected-block context changing in the editor. Merged from the
 * two demos' previous copies; the `image` set keeps the `action` suggestion
 * showcase.
 */
export const contextSuggestionSets: Record< SuggestionContext, Suggestion[] > =
	{
		button: [
			{
				id: '1',
				label: 'Edit link',
				prompt: 'Change the button link to:',
			},
			{
				id: '2',
				label: 'Remove button',
				prompt: 'Remove this button',
			},
			{
				id: '3',
				label: 'Change color',
				prompt: 'Change the button color to blue',
			},
		],
		heading: [
			{
				id: '4',
				label: 'Make uppercase',
				prompt: 'Make this text uppercase',
			},
			{
				id: '5',
				label: 'Change color',
				prompt: 'Change the text color to:',
			},
			{
				id: '6',
				label: 'Add shadow',
				prompt: 'Add a drop shadow to this text',
			},
		],
		image: [
			{
				id: '7',
				label: 'Make new image',
				prompt: 'Add an image here',
			},
			{
				id: '8',
				label: 'Replace with uploaded image',
				action: () => {
					return true;
				},
				prompt: 'Replace the current image with an uploaded image',
			},
			{
				id: '9',
				label: 'Add gallery with three images',
				prompt: 'Add a new gallery pattern to the page with three images, right below the currently selected pattern.',
			},
		],
		pattern: [
			{
				id: 'add-overlay',
				label: 'Add overlay',
				prompt: 'Add an overlay to the cover block and give me the color picker tool to change it.',
			},
			{
				id: 'change-pattern-style',
				label: 'Change pattern style',
				prompt: 'Show me the different styles I can apply to this pattern.',
			},
			{
				id: 'show-pattern-layout',
				label: 'Show different layouts',
				prompt: 'Give me alternative layout variations for this pattern, keeping all content and copy exactly the same.',
			},
		],
		none: [],
	};
