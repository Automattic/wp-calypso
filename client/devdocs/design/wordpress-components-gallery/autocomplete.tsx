/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { Autocomplete, __experimentalInputControl as InputControl } from '@wordpress/components';

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
		getOptionLabel: ( option ) => (
			<span>
				<span>{ option.visual }</span>
				{ option.name }
			</span>
		),
		// Declares that options should be matched by their name
		getOptionKeywords: ( option ) => [ option.name ],
		// Declares that the Grapes option is disabled
		isOptionDisabled: ( option ) => option.name === 'Grapes',
		// Declares completions should be inserted as abbreviations
		getOptionCompletion: ( option ) => <abbr title={ option.name }>{ option.visual }</abbr>,
	},
];

const AutocompleteExample = () => {
	const [ value, setValue ] = useState( '' );
	return (
		<div>
			<Autocomplete record={ value } onChange={ setValue } completers={ autocompleters }>
				{ ( { isExpanded, listBoxId, activeId, onKeyDown } ) => (
					<InputControl
						onKeyDown={ onKeyDown }
						aria-autocomplete="list"
						aria-expanded={ isExpanded }
						aria-owns={ listBoxId }
						aria-activedescendant={ activeId }
					/>
				) }
			</Autocomplete>
			<p>Type ~ for triggering the autocomplete.</p>
		</div>
	);
};

export default AutocompleteExample;
