import { RadioControl } from '@wordpress/components';
import { QuestionSelectionType } from './question-step';

const QuestionSingleSelection = ( { onChange, question, value }: QuestionSelectionType ) => {
	// Placeholder component
	return (
		<div className="question__single-selection">
			<RadioControl
				options={ question.options }
				selected={ value[ 0 ] }
				onChange={ ( value ) => {
					onChange( question.key, [ value ] );
				} }
			/>
		</div>
	);
};

export default QuestionSingleSelection;
