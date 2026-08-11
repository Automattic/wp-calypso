import * as React from 'react';
import { cn } from '../../utils/classNames';
import styles from './Textarea.module.css';

export type TextareaProps = React.TextareaHTMLAttributes< HTMLTextAreaElement >;

const Textarea = React.forwardRef< HTMLTextAreaElement, TextareaProps >(
	( { className, ...props }, ref ) => {
		return (
			<textarea
				data-slot="textarea"
				className={ cn( styles.textarea, className ) }
				ref={ ref }
				{ ...props }
			/>
		);
	}
);
Textarea.displayName = 'Textarea';

export { Textarea };
