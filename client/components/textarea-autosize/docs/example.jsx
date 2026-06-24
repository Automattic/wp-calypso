import TextareaAutosize from '../index';

TextareaAutosize.displayName = 'TextareaAutosize';
TextareaAutosizeExample.displayName = 'TextareaAutosize';

function TextareaAutosizeExample( {
	exampleCode = (
		<TextareaAutosize
			rows="1"
			defaultValue={
				'This textarea will grow and shrink to suit its content, ' +
				'though it keeps a minimum height.'
			}
		/>
	),
} ) {
	return exampleCode;
}

export default TextareaAutosizeExample;
