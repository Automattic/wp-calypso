import { QuestionSelectionComponentProps } from './question-step';
import SurveyCheckboxOption from './survey-checkbox-option';

const SurveyCheckboxControl = ( {
	onChange,
	question,
	value,
	disabled,
}: QuestionSelectionComponentProps ) => {
	return (
		<div className="question-options__container">
			{ question.options.map( ( option, index ) => (
				<SurveyCheckboxOption
					key={ index }
					option={ option }
					question={ question }
					onChange={ onChange }
					value={ value }
					disabled={ disabled }
				/>
			) ) }
		</div>
	);
};

export default SurveyCheckboxControl;
