import { QuestionSelectionType } from './question-step';

const QuestionMultipleSelection = ( { question }: QuestionSelectionType ) => {
	// Placeholder component
	return 'PLACEHOLDER: ' + question.options.map( ( option ) => option.label ).join( ', ' );
};

export default QuestionMultipleSelection;
