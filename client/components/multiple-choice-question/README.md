<!-- @format -->

# Multiple Choice Question

This is a component for presenting a question and a list of answers to a user. They may pick one and optionally add additional text.

## Usage

```es6
import MultipleChoiceQuestion from 'components/multiple-choice-question';

function MultipleChoiceQuestionExamples( { translate } ) {
	const [ selectedAnswer, setSelectedAnswer ] = useState( null );
	const [ answerText, setAnswerText ] = useState( '' );

	const question = translate( 'Please choose one of the following:' );
	const answers = [
		{
			id: 'hungry-bunnies',
			answerText: translate( 'Hungry Bunnies' ),
		},
		{
			id: 'ravenous-rhinos',
			answerText: translate( 'Ravenous Rhinos' ),
			textInput: true,
			textInputPrompt: translate( 'How many?' ),
		},
		{
			id: 'starving-storks',
			answerText: translate( 'Starving Storks' ),
		},
		{
			id: 'something-else',
			answerText: translate( 'Something Else' ),
			doNotShuffle: true,
			textInput: true,
			textInputPrompt: translate( 'Who else?' ),
		},
	];

	return (
		<div>
			<MultipleChoiceQuestion
				question={ question }
				answers={ answers }
				onAnswerChange={ ( answer, text ) => {
					setSelectedAnswer( answer );
					setAnswerText( text || '' );
				} }
			/>
			<h2>{ translate( 'Selected Answer' ) }</h2>
			<p>
				<b>Selected Answer is: </b>
				{ selectedAnswer ? selectedAnswer : translate( 'No Answer Currently Selected' ) }
			</p>
			<p>
				<b>Answer Text is: </b>
				{ answerText }
			</p>
		</div>
	);
}
```

## Props

### `question`

- **Type:** `String`
- **Required:** `yes`

The question to display at the top of the multiple choice

### `answers`

- **Type:** `Array`
- **Required:** `yes`

The list of answers to show. they have the following shape:

- `id`: `string` (Required) a translation-independent way to reference the each answer
- `answerText`: `string` (Required) the text of the answer
- `doNotShuffle`: `boolean` ( Default `false` ) prevents the anwser from being randomly shuffled. Its position will be respected.
- `textInput`: `boolean` ( Default `false` ) If the answer is selected, should a text input be shown
- `textInputPrompt`: `string` ( Default `''` ) the prompt to display in the text input referenced above

### `onAnwserChange`

- **Type:** `Function`
- **Required:** `no`
- **Default:** `undefined`

Handler for when the selected anwser of text is changed. Is called each time a new answer is selected. The arguements are `id`, and optionally `text` if the answer has a text input.

It will be called each time the text changes as well. If an answer previously had text, was changed, then changed back the original text will be saved.
