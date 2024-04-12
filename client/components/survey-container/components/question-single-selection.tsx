/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { QuestionSelectionType } from './question-step';

const QuestionSingleSelection = ( { onChange, question, value }: QuestionSelectionType ) => {
	return (
		<div className="question-options__container">
			{ question.options.map( ( option, index ) => (
				<div
					key={ index }
					className="question-options__option-control components-radio-control__option"
					onClick={ () => onChange( question.key, [ option.value ] ) }
				>
					<input
						type="radio"
						id={ `option-${ option.value }` }
						name={ question.key }
						value={ option.value }
						onChange={ () => onChange( question.key, [ option.value ] ) }
						checked={ value.includes( option.value ) }
						className="form-radio"
					/>
					<div className="question-options__option-label">
						<label htmlFor={ `option-${ option.value }` }>{ option.label }</label>
						{ option.helpText && (
							<span className="question-options__option-help-text">{ option.helpText }</span>
						) }
					</div>
				</div>
			) ) }
		</div>
	);
};

export default QuestionSingleSelection;
