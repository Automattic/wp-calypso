import { useCallback } from 'react';
import { QuestionSelectionType } from './question-step';
import SurveyRadioOption from './survey-radio-option';

const SurveyRadioControl = ( { onChange, question, value }: QuestionSelectionType ) => {
	const handleChange = useCallback(
		( questionKey: string, newValue: string[] ) => {
			if ( ! value.includes( newValue[ 0 ] ) ) {
				onChange( questionKey, newValue );
			}
		},
		[ onChange, value ]
	);

	return (
		<div className="question-options__container" role="radiogroup">
			{ question.options.map( ( option, index ) => (
				<SurveyRadioOption
					key={ index }
					question={ question }
					option={ option }
					onChange={ handleChange }
					value={ value }
				/>
			) ) }
		</div>
	);
};

export default SurveyRadioControl;
