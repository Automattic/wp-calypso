import React, { useId } from 'react';
import { CHECKLIST_PRESETS, type ChecklistPreset } from '../data/checklistSets';
import { ToolDropdown } from './ToolDropdown';

interface ChecklistToolProps {
	preset: ChecklistPreset;
	onPresetChange: ( preset: ChecklistPreset ) => void;
	/** Marks the in-progress task done, as the agent would after finishing it. */
	onComplete: () => void;
	onReset: () => void;
}

/**
 * View tool for the mocked launch checklist: a radio list of status presets,
 * a button that completes the task in progress, and one that starts the
 * conversation over with the checklist back in the chat.
 * @param props                Component props.
 * @param props.preset
 * @param props.onPresetChange
 * @param props.onComplete
 * @param props.onReset
 */
export function ChecklistTool( {
	preset,
	onPresetChange,
	onComplete,
	onReset,
}: ChecklistToolProps ) {
	const radioName = useId();
	const current = CHECKLIST_PRESETS.find( ( option ) => option.id === preset );

	return (
		<ToolDropdown label={ `Checklist · ${ current?.label ?? preset }` }>
			{ ( { close } ) => (
				<div className="tool-panel">
					<div className="suggestions-tool" role="radiogroup" aria-label="Checklist preset">
						{ CHECKLIST_PRESETS.map( ( option ) => (
							<label
								key={ option.id }
								className="suggestions-tool__option"
								htmlFor={ `${ radioName }-${ option.id }` }
							>
								<input
									id={ `${ radioName }-${ option.id }` }
									type="radio"
									name={ radioName }
									checked={ preset === option.id }
									onChange={ () => onPresetChange( option.id ) }
								/>
								{ option.label }
							</label>
						) ) }
					</div>
					<div className="tool-panel__actions">
						<button
							type="button"
							className="playground-tool"
							onClick={ () => {
								onComplete();
								close();
							} }
						>
							Complete in-progress task
						</button>
						<button
							type="button"
							className="playground-tool"
							onClick={ () => {
								onReset();
								close();
							} }
						>
							Reset chat
						</button>
					</div>
				</div>
			) }
		</ToolDropdown>
	);
}
