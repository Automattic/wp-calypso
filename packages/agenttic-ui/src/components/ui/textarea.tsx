import * as React from 'react';
import styles from './Textarea.module.css';

export type TextareaProps = React.TextareaHTMLAttributes< HTMLTextAreaElement >;

const Textarea = React.forwardRef< HTMLTextAreaElement, TextareaProps >(
	( { className, ...props }, ref ) => {
		return (
			<textarea
				data-slot="textarea"
				className={ styles.textarea }
				ref={ ref }
				{ ...props }
			/>
		);
	}
);
Textarea.displayName = 'Textarea';

export { Textarea };
