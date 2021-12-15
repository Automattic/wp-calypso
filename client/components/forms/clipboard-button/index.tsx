import { Button } from '@automattic/components';
import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ButtonProps } from '@automattic/components';
import type { ForwardRefRenderFunction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface ClipboardProps extends ButtonProps {
	text: string | ( () => string );
	onCopy?: () => void;
}

// A button which, when clicked, copies the given text to the clipboard.
const ClipboardButton: ForwardRefRenderFunction< HTMLButtonElement, ClipboardProps > = (
	{ className, text, onCopy = noop, ...rest },
	ref
) => {
	const copyText = () => {
		// Allow function to get text to avoid calling it on every render.
		const copyText = typeof text === 'string' ? text : text();
		navigator.clipboard.writeText( copyText ).then( onCopy );
	};

	return (
		<Button
			{ ...rest }
			ref={ ref }
			onClick={ copyText }
			className={ classNames( 'clipboard-button', className ) }
		/>
	);
};

export default forwardRef( ClipboardButton );
