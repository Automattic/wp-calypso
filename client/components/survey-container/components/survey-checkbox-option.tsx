import { CheckboxControl } from '@wordpress/components';
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
	return (
		<div className={ `question-options__option-control ${ isSelected ? 'checked' : '' }` }>
			<CheckboxControl
				label={ option.label }
				checked={ isSelected }
				onChange={ ( checked ) => {
					const newValue = checked
						? [ ...value, option.value ]
						: value.filter( ( v ) => v !== option.value );

					onChange( question.key, newValue );
				} }
			/>
		</div>
	);
};

export default SurveyCheckboxOption;
