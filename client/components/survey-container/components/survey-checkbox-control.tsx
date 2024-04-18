import { QuestionSelectionType } from './question-step';
import SurveyCheckboxOption from './survey-checkbox-option';

const SurveyCheckboxControl = ( { onChange, question, value }: QuestionSelectionType ) => {
	return (
		<div className="question__multiple-selection">
			{ question.options.map( ( option, index ) => (
				<SurveyCheckboxOption
					key={ index }
					option={ option }
					question={ question }
					onChange={ onChange }
					value={ value }
				></SurveyCheckboxOption>
			) ) }
		</div>
	);
};

export default SurveyCheckboxControl;
