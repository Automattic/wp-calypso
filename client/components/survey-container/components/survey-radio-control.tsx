import { QuestionSelectionType } from './question-step';
import SurveyRadioOption from './survey-radio-option';

const SurveyRadioControl = ( { onChange, question, value }: QuestionSelectionType ) => {
	return (
		<div className="question-options__container" role="radiogroup">
			{ question.options.map( ( option, index ) => (
				<SurveyRadioOption
					key={ index }
					question={ question }
					option={ option }
					onChange={ onChange }
					value={ value }
				></SurveyRadioOption>
			) ) }
		</div>
	);
};

export default SurveyRadioControl;
