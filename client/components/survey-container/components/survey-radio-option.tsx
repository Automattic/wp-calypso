import { Question, Option } from '../types';

type SurveyRadioOptionType = {
	question: Question;
	option: Option;
	onChange: ( key: string, value: string[] ) => void;
	value: string[];
};

const SurveyRadioOption = ( { question, option, onChange, value }: SurveyRadioOptionType ) => {
	const isSelected = value.includes( option.value );
	const handleKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			onChange( question.key, [ option.value ] );
		}
	};

	return (
		<div
			className={ `question-options__option-control components-radio-control__option ${
				isSelected ? 'checked' : ''
			}` }
			role="radio"
			tabIndex={ 0 }
			onClick={ () => onChange( question.key, [ option.value ] ) }
			onKeyDown={ handleKeyDown }
			aria-checked={ isSelected ? 'true' : 'false' }
			aria-labelledby={ `option-label-${ option.value } option-help-text-${ option.value }` }
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
				<label id={ `option-label-${ option.value }` } htmlFor={ `option-${ option.value }` }>
					{ option.label }
				</label>
				{ option.helpText && (
					<span
						id={ `option-help-text-${ option.value }` }
						className="question-options__option-help-text"
					>
						{ option.helpText }
					</span>
				) }
			</div>
		</div>
	);
};

export default SurveyRadioOption;
