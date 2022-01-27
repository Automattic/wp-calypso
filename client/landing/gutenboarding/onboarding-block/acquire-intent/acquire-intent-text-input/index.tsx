import classnames from 'classnames';
import * as React from 'react';
import getTextWidth from '../get-text-width';

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
				key="acquire-intent__input"
				className={ classnames( 'acquire-intent-text-input__input', {
					'is-empty': ! ( value as string ).length,
				} ) }
				id={ id }
				ref={ ref }
				autoComplete="off"
				autoCorrect="off"
				onChange={ handleChange }
				spellCheck={ false }
				defaultValue={ value }
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
