import { Button } from '@automattic/components';
import clsx from 'clsx';
import { forwardRef } from 'react';

interface ClipboardButtonProps {
	className?: string;
	compact?: boolean;
	disabled?: boolean;
	primary?: boolean;
	scary?: boolean;
	busy?: boolean;
	borderless?: boolean;
	plain?: boolean;
	transparent?: boolean;
	text: string | null;
	onCopy?: () => void;
	onMouseLeave?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const ClipboardButton = forwardRef<
	HTMLButtonElement,
	React.PropsWithChildren< ClipboardButtonProps >
>( ( { className, text, onCopy = noop, ...rest }, ref ) => {
	function onCopyHandler() {
		if ( text ) {
			navigator.clipboard.writeText( text );
			onCopy();
		}
	}

	return (
		<Button
			{ ...rest }
			onClick={ onCopyHandler }
			ref={ ref }
			className={ clsx( 'clipboard-button', className ) }
		/>
	);
} );

export default ClipboardButton;
