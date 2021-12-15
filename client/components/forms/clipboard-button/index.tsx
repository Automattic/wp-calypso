import { Button } from '@automattic/components';
import classNames from 'classnames';
import Clipboard from 'clipboard';
import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import ReactDom from 'react-dom';

const noop = () => {};

function ClipboardButton( { className, text, onCopy = noop, ...rest } ) {
	const buttonRef = useRef();

	const textCallback = useRef();
	const successCallback = useRef();

	// update the callbacks on rerenders that change `text` or `onCopy`
	useEffect( () => {
		textCallback.current = () => text;
		successCallback.current = onCopy;
	}, [ text, onCopy ] );

	// create the `Clipboard` object on mount and destroy on unmount
	useEffect( () => {
		const buttonEl = ReactDom.findDOMNode( buttonRef.current );
		const clipboard = new Clipboard( buttonEl, { text: () => textCallback.current() } );
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
}

ClipboardButton.propTypes = {
	className: PropTypes.string,
	text: PropTypes.string,
	onCopy: PropTypes.func,
};

export default ClipboardButton;
