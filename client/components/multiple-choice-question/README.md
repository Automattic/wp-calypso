<!-- @format -->

# Multiple Choice Question

This is a component for presenting a question and a list of answers to a user. They may pick one and optionally add additional text.

## Usage

```es6
import MultipleChoiceQuestion from 'components/multiple-choice-question';

function MultipleChoiceQuestionExamples( { translate } ) {
	const [ selectedAnswer, setSelectedAnswer ] = useState( null );
	const [ answerText, setAnswerText ] = useState( '' );

	return (
		<div>
			<MultipleChoiceQuestion
				question={ 'Please choose one of the following:' }
				onAnswerChange={ ( answer, text ) => {
					setSelectedAnswer( answer );
					setAnswerText( text || '' );
				} }
			>
				<MultipleChoiceAnswer id={ 'hungry-bunnies' } answerText={ 'Hungry Bunnies' } />
				<MultipleChoiceAnswer
					id={ 'ravenous-rhinos' }
					answerText={ 'Ravenous Rhinos' }
					textInput
					textInputPrompt={ 'How many?' }
				/>
				<MultipleChoiceAnswer id={ 'starving-storks' } answerText={ 'Starving Storks' }>
					<Button
						onClick={ () => {
							notices.success( 'The Stork Button was clicked', { duration: 5000 } );
						} }
						primary
					>
						{ 'The Stork Button' }
					</Button>
				</MultipleChoiceAnswer>
				<MultipleChoiceAnswer
					id={ 'something-else' }
					answerText={ 'Something Else' }
					doNotShuffle
					textInput
					textInputPrompt={ 'Who else?' }
				>
					<Button
						onClick={ () => {
							notices.success( 'The Extra Button was clicked', { duration: 5000 } );
						} }
					>
						{ 'The Extra Button' }
					</Button>
				</MultipleChoiceAnswer>
			</MultipleChoiceQuestion>
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
- **Required:** `no`
- **Default:** `undefined`

Handler for when the selected answer of text is changed. Is called each time a new answer is selected. The arguments are `id`, and optionally `text` if the answer has a text input.

It will be called each time the text changes as well. If an answer previously had text, was changed, then changed back the original text will be saved.

# Multiple Choice Answer

This Component represents a possible answer for the MultipleChoiceQuestion. it is the only type of child that the Question will accept, and will only work correctly as a child of a Question. It itself will render any of its children when and only when it is selected. In addition it provides a helper that will easily render a child text field, the most common pattern for a child. The input of this child we actually be passed back through the MultipleChoiceQuestion component via the `onAnswerChange` function.

## Props

### `id`

- **Type:** `String`
- **Required:** `yes`

A translation-independent way to reference the each answer. This is what will be passed back through the `onAnswerChange` function.

### `answerText`

- **Type:** `String`
- **Required:** `yes`

The text of the answer to display.

### `doNotShuffle`

- **Type:** `Boolean`
- **Required:** `no`
- **Default:** `false`

prevents the answer from being randomly shuffled. Its position will be respected.

### `textInput`

- **Type:** `Boolean`
- **Required:** `no`
- **Default:** `false`

If the answer is selected, should a text input be shown.

### `textInputPrompt`

- **Type:** `String`
- **Required:** `no`
- **Default:** `''`

the prompt to display in the text input referenced above.
