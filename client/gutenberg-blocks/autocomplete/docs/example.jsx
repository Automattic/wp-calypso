/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { Autocomplete } from '@wordpress/components';


Autocomplete.displayName = 'Autocomplete';

const autocompleters = [
	{
		name: 'fruit',
		// The prefix that triggers this completer
		triggerPrefix: '~',
		// The option data
		options: [
			{ visual: '🍎', name: 'Apple', id: 1 },
			{ visual: '🍊', name: 'Orange', id: 2 },
			{ visual: '🍇', name: 'Grapes', id: 3 },
		],
		// Returns a label for an option like "🍊 Orange"
		getOptionLabel: option => (
			<span>
				<span className="icon" >{ option.visual }</span>{ option.name }
			</span>
		),
		// Declares that options should be matched by their name
		getOptionKeywords: option => [ option.name ],
		// Declares that the Grapes option is disabled
		isOptionDisabled: option => option.name === 'Grapes',
		// Declares completions should be inserted as abbreviations
		getOptionCompletion: option => (
			<abbr title={ option.name }>{ option.visual }</abbr>
		),
	}
];

export default class extends React.PureComponent {
	static displayName = 'Autocomplete';

	render() {
		return (
			<Autocomplete completers={ autocompleters }>
				{ ( { isExpanded, listBoxId, activeId } ) => (
					<div
						contentEditable
						suppressContentEditableWarning
					>
					</div>
				) }
			</Autocomplete>
		);
	}
};
