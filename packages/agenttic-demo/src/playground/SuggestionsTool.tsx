import React, { useId, useState } from 'react';
import type { Suggestion } from '@automattic/agenttic-ui';
import { ToolDropdown } from './ToolDropdown';
import { contextSuggestionSets } from '../data/suggestionSets';

type SuggestionsChoice = 'default' | 'heading' | 'image' | 'pattern' | 'none';

const CHOICES: Array< { id: SuggestionsChoice; label: string } > = [
	{ id: 'default', label: 'Default' },
	{ id: 'heading', label: 'Heading' },
	{ id: 'image', label: 'Image' },
	{ id: 'pattern', label: 'Pattern' },
	{ id: 'none', label: 'None' },
];

interface SuggestionsToolProps {
	/** The demo's own suggestion set, registered by the "Default" option. */
	defaultSuggestions?: Suggestion[];
	registerSuggestions: ( suggestions: Suggestion[] ) => void;
}

/**
 * View tool for switching the registered suggestion set: a dropdown with a
 * radio list of the demo's default set, the shared editor-context sets
 * (heading/image/pattern), or none.
 *
 * @param props                     Component props.
 * @param props.defaultSuggestions
 * @param props.registerSuggestions
 */
export function SuggestionsTool( {
	defaultSuggestions = [],
	registerSuggestions,
}: SuggestionsToolProps ) {
	const [ selected, setSelected ] =
		useState< SuggestionsChoice >( 'default' );
	const radioName = useId();

	const handleChange = ( choice: SuggestionsChoice ) => {
		setSelected( choice );
		registerSuggestions(
			choice === 'default'
				? defaultSuggestions
				: contextSuggestionSets[ choice ]
		);
	};

	return (
		<ToolDropdown label="Suggestions">
			<div
				className="suggestions-tool"
				role="radiogroup"
				aria-label="Suggestion set"
			>
				{ CHOICES.map( ( choice ) => (
					<label
						key={ choice.id }
						className="suggestions-tool__option"
						htmlFor={ `${ radioName }-${ choice.id }` }
					>
						<input
							id={ `${ radioName }-${ choice.id }` }
							type="radio"
							name={ radioName }
							checked={ selected === choice.id }
							onChange={ () => handleChange( choice.id ) }
						/>
						{ choice.label }
					</label>
				) ) }
			</div>
		</ToolDropdown>
	);
}
