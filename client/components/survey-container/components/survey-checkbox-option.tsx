import { Question, Option } from '../types';

// todo: consider renaming and moving the type into ../types
type SurveyCheckboxOptionType = {
	question: Question;
	option: Option;
	onChange: ( key: string, value: string[] ) => void;
	value: string[];
};

const SurveyCheckboxOption = ( {
	question,
	option,
	onChange,
	value,
}: SurveyCheckboxOptionType ) => {
	const isSelected = value.includes( option.value );

	const handleToggle = () => {
		const newValue = isSelected
			? value.filter( ( v ) => v !== option.value )
			: [ ...value, option.value ];

		onChange( question.key, newValue );
	};

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			handleToggle();
		}
	};

	return (
		<div
			className={ `question-options__option-control ${ isSelected ? 'checked' : '' }` }
			onClick={ handleToggle }
			onKeyDown={ handleKeyDown }
			role="checkbox"
			tabIndex={ 0 }
			aria-checked={ isSelected ? 'true' : 'false' }
		>
			<input
				type="checkbox"
				id={ `option-${ option.value }` }
				name={ question.key }
				value={ option.value }
				onChange={ handleToggle }
				checked={ isSelected }
				className="form-checkbox"
				tabIndex={ -1 }
				aria-hidden="true"
			/>
		</div>
	);
};

export default SurveyCheckboxOption;
