import { QuestionSelectionType } from './question-step';

const QuestionSingleSelection = ( { onChange, question, value }: QuestionSelectionType ) => {
	return (
		<div className="question-options__container" role="radiogroup">
			{ question.options.map( ( option, index ) => {
				const isSelected = value.includes( option.value );
				const handleKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
					if ( event.key === 'Enter' || event.key === ' ' ) {
						onChange( question.key, [ option.value ] );
					}
				};

				return (
					<div
						key={ index }
						className={ `question-options__option-control components-radio-control__option ${
							isSelected ? 'checked' : ''
						}` }
						role="radio"
						tabIndex={ 0 }
						aria-checked={ isSelected.toString() }
						onClick={ () => onChange( question.key, [ option.value ] ) }
						onKeyDown={ handleKeyDown }
						aria-labelledby={ `optionLabel-${ option.value } optionHelpText-${ option.value }` }
					>
						<input
							type="radio"
							id={ `option-${ option.value }` }
							name={ question.key }
							value={ option.value }
							onChange={ () => onChange( question.key, [ option.value ] ) }
							checked={ isSelected }
							className="form-radio"
							tabIndex={ -1 }
							aria-hidden="true"
						/>
						<div className="question-options__option-label">
							<label id={ `optionLabel-${ option.value }` } htmlFor={ `option-${ option.value }` }>
								{ option.label }
							</label>
							{ option.helpText && (
								<span
									id={ `optionHelpText-${ option.value }` }
									className="question-options__option-help-text"
								>
									{ option.helpText }
								</span>
							) }
						</div>
					</div>
				);
			} ) }
		</div>
	);
};

export default QuestionSingleSelection;
