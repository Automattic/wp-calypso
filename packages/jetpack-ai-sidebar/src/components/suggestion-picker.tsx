/**
 * SuggestionPicker — shared single-select suggestion list for the chat sidebar.
 *
 * Renders an intro line followed by a list of suggestion cards. Clicking a card
 * applies that value via the `onApply` callback and highlights it; the picker
 * stays visible so the user can click through options. An optional inline
 * confirmation (`appliedMessage`) is shown once a value has been applied.
 *
 * This is the shared building block behind the title-picker, seo-title-picker
 * and seo-description-picker wrappers — they differ only in their intro text,
 * what "apply" writes to, and their confirmation copy, so the rendering and
 * selection live here once.
 */

/**
 * External dependencies
 */
import { useState, useCallback } from '@wordpress/element';

/**
 * Props for the SuggestionPicker component.
 */
interface SuggestionPickerProps {
	intro: string;
	options: string[];
	onApply: ( value: string ) => void;
	/** Optional confirmation shown inline once a value has been applied. */
	appliedMessage?: string;
}

/**
 * SuggestionPicker component for the chat sidebar.
 * @param {SuggestionPickerProps} props - Component props.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function SuggestionPicker( {
	intro,
	options,
	onApply,
	appliedMessage,
}: SuggestionPickerProps ) {
	const [ appliedValue, setAppliedValue ] = useState< string | null >( null );

	const handleApply = useCallback(
		( value: string ) => {
			onApply( value );
			setAppliedValue( value );
		},
		[ onApply ]
	);

	return (
		<div className="jetpack-ai-suggestion-picker">
			<p className="jetpack-ai-suggestion-picker__intro">{ intro }</p>
			<div className="jetpack-ai-suggestion-picker__options">
				{ options.map( ( value, index ) => {
					const isApplied = value === appliedValue;
					return (
						<button
							key={ `${ value }-${ index }` }
							type="button"
							className={ `jetpack-ai-suggestion-picker__card${ isApplied ? ' is-applied' : '' }` }
							onClick={ () => handleApply( value ) }
							aria-pressed={ isApplied }
						>
							<span className="jetpack-ai-suggestion-picker__card-text">{ value }</span>
						</button>
					);
				} ) }
			</div>
			{ appliedValue !== null && appliedMessage && (
				<p className="jetpack-ai-suggestion-picker__status">{ appliedMessage }</p>
			) }
		</div>
	);
}
