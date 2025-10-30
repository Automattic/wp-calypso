import { WordPressComponentProps } from '@wordpress/components/build-types/context/wordpress-component';
import { forwardRef, useState } from '@wordpress/element';
import clsx from 'clsx';
import type { ChangeEvent, ForwardedRef, FocusEventHandler } from 'react';

interface TokenInputProps {
	isExpanded: boolean;
	instanceId: string | number;
	selectedSuggestionIndex: number;
	onChange?: ( { value }: { value: string } ) => void;
	value: string;
}

export function UnForwardedTokenInput(
	props: WordPressComponentProps< TokenInputProps, 'input', false >,
	ref: ForwardedRef< HTMLInputElement >
) {
	const {
		value,
		isExpanded,
		instanceId,
		selectedSuggestionIndex,
		className,
		onChange,
		onFocus,
		onBlur,
		...restProps
	} = props;

	const [ hasFocus, setHasFocus ] = useState( false );

	const size = value ? value.length + 1 : 0;

	const onChangeHandler = ( event: ChangeEvent< HTMLInputElement > ) => {
		if ( onChange ) {
			onChange( {
				value: event.target.value,
			} );
		}
	};

	const onFocusHandler: FocusEventHandler< HTMLInputElement > = ( e ) => {
		setHasFocus( true );
		onFocus?.( e );
	};

	const onBlurHandler: FocusEventHandler< HTMLInputElement > = ( e ) => {
		setHasFocus( false );
		onBlur?.( e );
	};

	return (
		<input
			ref={ ref }
			id={ `components-form-token-input-${ instanceId }` }
			type="text"
			{ ...restProps }
			value={ value || '' }
			onChange={ onChangeHandler }
			onFocus={ onFocusHandler }
			onBlur={ onBlurHandler }
			size={ size }
			className={ clsx( className, 'components-form-token-field__input' ) }
			autoComplete="off"
			role="combobox"
			aria-controls={ String( instanceId ) }
			aria-expanded={ isExpanded }
			aria-autocomplete="list"
			aria-owns={ isExpanded ? `components-form-token-suggestions-${ instanceId }` : undefined }
			aria-activedescendant={
				// Only add the `aria-activedescendant` attribute when:
				// - the user is actively interacting with the input (`hasFocus`)
				// - there is a selected suggestion (`selectedSuggestionIndex !== -1`)
				// - the list of suggestions are rendered in the DOM (`isExpanded`)
				hasFocus && selectedSuggestionIndex !== -1 && isExpanded
					? `components-form-token-suggestions-${ instanceId }-${ selectedSuggestionIndex }`
					: undefined
			}
			aria-describedby={ `components-form-token-suggestions-howto-${ instanceId }` }
		/>
	);
}

export const TokenInput = forwardRef( UnForwardedTokenInput );

export default TokenInput;
