/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Autocomplete } from '@wordpress/components';

/**
 * Style dependencies
 */
import './autocomplete.scss';

const Example = () => {
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

	return (
		<div>
			<Autocomplete completers={ autocompleters }>
				{ ( { isExpanded, listBoxId, activeId, onKeyDown } ) => (
					/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/aria-activedescendant-has-tabindex */
					<div
						className="wordpress-components-gallery__autocomplete-editable"
						contentEditable
						onKeyDown={ onKeyDown }
						suppressContentEditableWarning
						aria-autocomplete="list"
						aria-expanded={ isExpanded }
						aria-owns={ listBoxId }
						aria-activedescendant={ activeId }
					></div>
					/* eslint-enable */
				) }
			</Autocomplete>
			<p>Type ~ for triggering the autocomplete.</p>
		</div>
	);
};

export default Example;
