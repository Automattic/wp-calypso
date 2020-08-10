/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	value: string;
	onChange: ( value: string ) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	onKeyUp?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	autoFocus?: boolean;
	placeholder?: string;
}

/**
 * Gets the font info from an input field then measures the width of the text within
 *
 * @param text the string
 * @param element The input element
 */
function getTextWidth( text: string, element: HTMLInputElement | null ) {
	if ( ! element ) {
		return 0;
	}
	const canvas = document.createElement( 'canvas' );
	canvas.width = canvas.height = 2000;
	const canvasContext = canvas.getContext( '2d' ) as CanvasRenderingContext2D;
	canvasContext.font = window.getComputedStyle( element ).font;
	return canvasContext.measureText( text ).width;
}

const AcquireIntentTextInput: React.FunctionComponent< Props > = ( {
	value,
	onChange,
	onFocus,
	onBlur,
	autoFocus,
	placeholder,
	onKeyDown,
	onKeyUp,
} ) => {
	const ref = React.useRef< HTMLInputElement >( null );
	const width = getTextWidth( ( value as string ) ?? '', ref.current );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		onChange?.( event.target.value );
	};

	return (
		<div className="acquire-intent-text-input__wrapper">
			<input
				key="acquire-intent__input"
				className={ classnames( 'acquire-intent-text-input__input', {
					'is-empty': ! ( value as string ).length,
				} ) }
				ref={ ref }
				autoComplete="off"
				autoCorrect="off"
				onChange={ handleChange }
				data-hj-whitelist
				spellCheck={ false }
				value={ value }
				onFocus={ onFocus }
				onBlur={ onBlur }
				onKeyDown={ onKeyDown }
				onKeyUp={ onKeyUp }
				autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
				placeholder={ placeholder }
			/>
			<div
				className={ classnames( 'acquire-intent-text-input__underline', {
					'is-empty': ! ( value as string ).length,
				} ) }
				style={ { width: width || '100%' } }
			></div>
		</div>
	);
};

export default AcquireIntentTextInput;
