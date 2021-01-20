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
	id?: string;
	forwardedRef: React.MutableRefObject< HTMLInputElement | undefined >;
}

/**
 * A canvas to use to create text and measure its width.
 * This is needed for the underline width.
 */
const textSizingCanvas = document.createElement( 'canvas' );
textSizingCanvas.width = textSizingCanvas.height = 2000;
const canvasContext = textSizingCanvas.getContext( '2d' ) as CanvasRenderingContext2D;

/**
 * Gets the font info from an input field then measures the width of the text within
 *
 * @param text the string
 * @param element The input element
 */
function getTextWidth( text: string, element: HTMLInputElement | undefined ) {
	if ( ! element ) {
		return 0;
	}
	const computedCSS = window.getComputedStyle( element );

	// FF returns an empty strong in font prop
	canvasContext.font = computedCSS.font || `${ computedCSS.fontSize } ${ computedCSS.fontFamily }`;
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
	id,
	forwardedRef,
} ) => {
	const defaultRef = React.useRef< HTMLInputElement >();
	const ref = ( forwardedRef || defaultRef ) as React.MutableRefObject< HTMLInputElement >;

	const underlineWidth = getTextWidth( value || '', ref.current );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		onChange?.( event.target.value );
	};

	return (
		<div className="acquire-intent-text-input__wrapper">
			<input
				className={ classnames( 'acquire-intent-text-input__input', {
					'is-empty': ! value.length,
				} ) }
				id={ id }
				ref={ ref }
				autoComplete="off"
				autoCorrect="off"
				onChange={ handleChange }
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
					'is-empty': ! value.length,
				} ) }
				style={ { width: underlineWidth || '100%' } }
			></div>
		</div>
	);
};

export default React.forwardRef< HTMLInputElement, Omit< Props, 'forwardedRef' > >(
	( props, ref ) => (
		<AcquireIntentTextInput
			{ ...props }
			forwardedRef={ ref as React.MutableRefObject< HTMLInputElement | undefined > }
		/>
	)
);
