import { CheckboxControl } from '@wordpress/components';
import { QuestionSelectionType } from './question-step';

const SurveyCheckboxControl = ( { onChange, question, value }: QuestionSelectionType ) => {
	// Placeholder component
	return (
		<div className="question__multiple-selection">
			{ question.options.map( ( option, index ) => (
				<div key={ index } className="question__multiple-selection-option">
					<CheckboxControl
						label={ option.label }
						checked={ value.includes( option.value ) }
						onChange={ ( checked ) => {
							const newValue = checked
								? [ ...value, option.value ]
								: value.filter( ( v ) => v !== option.value );

							onChange( question.key, newValue );
						} }
					/>
				</div>
			) ) }
		</div>
	);
};

export default SurveyCheckboxControl;
