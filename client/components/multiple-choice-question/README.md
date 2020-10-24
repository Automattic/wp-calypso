# Multiple Choice Question

This is a component for presenting a question and a list of answers to a user. They may pick one and optionally add additional text.

## Usage

```jsx
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';

function MultipleChoiceQuestionExamples( { translate } ) {
	const [ selectedAnswer, setSelectedAnswer ] = useState( null );
	const [ answerText, setAnswerText ] = useState( '' );

	const answers = [
		{ id: 'hungry-bunnies', answerText: 'Hungry Bunnies' },
		{
			id: 'ravenous-rhinos',
			answerText: 'Ravenous Rhinos',
			textInput: true,
			textInputPrompt: 'How many?',
		},
		{
			id: 'starving-storks',
			answerText: 'Starving Storks',
			children: (
				<Button
					onClick={ () => {
						notices.success( 'The Stork Button was clicked', { duration: 5000 } );
					} }
					primary
				>
					{ 'The Stork Button' }
				</Button>
			),
		},
		{
			id: 'something-else',
			answerText: 'Something Else',
			doNotShuffle: true,
			textInput: true,
			textInputPrompt: 'Who else?',
			children: (
				<Button
					onClick={ () => {
						notices.success( 'The Extra Button was clicked', { duration: 5000 } );
					} }
				>
					{ 'The Extra Button' }
				</Button>
			),
		},
	];

	return (
		<div>
			<MultipleChoiceQuestion
				answers={ answers }
				question={ 'Please choose one of the following:' }
				onAnswerChange={ ( answer, text ) => {
					setSelectedAnswer( answer );
					setAnswerText( text || '' );
				} }
			/>
			<h2>{ 'Selected Answer' }</h2>
			<p>
				<b>Selected Answer is: </b>
				{ selectedAnswer ? selectedAnswer : 'No Answer Currently Selected' }
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

### `onAnswerChange`

- **Type:** `Function`
- **Required:** `yes`

Handler for when the selected answer of the multiple choice is changeed. It is called each time a new answer is selected **OR** when the optional text input of the selected answer is changes. The arguments are `id`, and optionally `text` if the answer has a text input.

### `selectedAnswerId`

- **Type:** `String`
- **Required:** `no`
- **Default:** `null`

Sets the initial answer selection of the multiple choice to the given answer id.

### `selectedAnswerText`

- **Type:** `String`
- **Required:** `no`
- **Default:** `''`

sets the text prompt of initial answer selection of the multiple choice to the given text. Only works when `selectedAnswerId` is given.

### `answers`

- **Type:** `Array`
- **Required:** `yes`

The answers to display. Each answer is an object with the following properties.

#### Props

##### `id`

- **Type:** `String`
- **Required:** `yes`

A translation-independent way to reference each answer. This is what will be passed back through the `onAnswerChange` function.

##### `answerText`

- **Type:** `String`
- **Required:** `yes`

The text of the answer to display.

##### `doNotShuffle`

- **Type:** `Boolean`
- **Required:** `no`
- **Default:** `false`

prevents the answer from being randomly shuffled. Its position will be respected.

##### `textInput`

- **Type:** `Boolean`
- **Required:** `no`
- **Default:** `false`

If the answer is selected, should a text input be shown.

##### `textInputPrompt`

- **Type:** `String`
- **Required:** `no`
- **Default:** `''`

The prompt to display in the text input referenced above.
