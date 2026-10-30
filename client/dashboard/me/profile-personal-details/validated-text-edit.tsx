import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { createContext, useContext, useEffect, useRef } from 'react';
import type { DataFormControlProps } from '@wordpress/dataviews';
import type { InputHTMLAttributes } from 'react';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { ValidatedInputControl } = unlock( privateApis );

type InputAttributes = Pick<
	InputHTMLAttributes< HTMLInputElement >,
	'id' | 'name' | 'type' | 'autoComplete' | 'autoCapitalize' | 'autoCorrect'
>;

/**
 * When true, fields inside reveal their validity message without waiting for the input to be
 * blurred, e.g. for an error that comes from the server rather than from what the user typed.
 */
export const ShowValidityImmediatelyContext = createContext( false );

/**
 * Creates a DataForm `Edit` for a text field whose validation feedback comes from DataForm's
 * `validity` prop. Call it at module level so DataForm gets a stable component and the input keeps
 * focus while typing.
 */
export function createValidatedTextEdit< Item >( inputAttributes: InputAttributes ) {
	return function ValidatedTextEdit( {
		data,
		field,
		onChange,
		validity,
	}: DataFormControlProps< Item > ) {
		const showValidityImmediately = useContext( ShowValidityImmediatelyContext );
		const inputRef = useRef< HTMLInputElement >( null );

		// The validated control only shows its message once the input has been blurred or fired an
		// `invalid` event. reportValidity() fires that event, but the control also focuses the input
		// in response, so hand focus back to where it was.
		useEffect( () => {
			const input = inputRef.current;
			if ( ! showValidityImmediately || ! input ) {
				return;
			}
			const previouslyFocused = input.ownerDocument.activeElement;
			input.reportValidity();
			if ( previouslyFocused instanceof HTMLElement && previouslyFocused !== document.body ) {
				previouslyFocused.focus();
			} else {
				input.blur();
			}
		}, [ showValidityImmediately ] );

		return (
			<ValidatedInputControl
				{ ...inputAttributes }
				ref={ inputRef }
				__next40pxDefaultSize
				required={ !! field.isValid?.required }
				customValidity={ validity?.custom }
				label={ field.label }
				help={ field.description }
				value={ field.getValue( { item: data } ) ?? '' }
				onChange={ ( value?: string ) =>
					onChange( field.setValue( { item: data, value: value ?? '' } ) )
				}
				disabled={ field.isDisabled( { item: data, field } ) }
			/>
		);
	};
}
