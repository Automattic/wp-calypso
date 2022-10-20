import { Button } from '@automattic/components';
import classNames from 'classnames';
import Clipboard from 'clipboard';
import { useRef, useEffect, forwardRef } from 'react';
import ReactDom from 'react-dom';

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
	let buttonRef = useRef< HTMLButtonElement >( null );

	if ( ref ) {
		buttonRef = ref as React.RefObject< HTMLButtonElement >;
	}

	const textCallback = useRef< () => string | null >( () => '' );
	const successCallback = useRef< () => void >( noop );

	// update the callbacks on rerenders that change `text` or `onCopy`
	useEffect( () => {
		textCallback.current = () => text;
		successCallback.current = onCopy;
	}, [ text, onCopy ] );

	// create the `Clipboard` object on mount and destroy on unmount
	useEffect( () => {
		const buttonEl = ReactDom.findDOMNode( buttonRef.current ) as Element;
		const clipboard = new Clipboard( buttonEl, { text: () => textCallback.current() as string } );
		clipboard.on( 'success', () => successCallback.current() );

		return () => clipboard.destroy();
	}, [] );

	return (
		<Button
			{ ...rest }
			ref={ buttonRef }
			className={ classNames( 'clipboard-button', className ) }
		/>
	);
} );

export default ClipboardButton;
