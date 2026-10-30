import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useEffect, useRef } from 'react';
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
 * A DataForm `Edit` for a text field whose validation feedback comes from DataForm’s `validity`
 * prop. The validated control only shows its message once the input has been blurred or fired an
 * `invalid` event, so an error that is already present on mount (e.g. one that comes from the
 * server) is revealed explicitly.
 *
 * Wrap it in a module-level component per field rather than declaring that inline in `fields`:
 * DataForm remounts the input, losing focus, whenever the `Edit` identity changes.
 */
export function ValidatedTextEdit< Item >( {
	data,
	field,
	onChange,
	validity,
	...inputAttributes
}: DataFormControlProps< Item > & InputAttributes ) {
	const inputRef = useRef< HTMLInputElement >( null );

	useEffect( () => {
		const input = inputRef.current;
		if ( validity?.custom?.type !== 'invalid' || ! input ) {
			return;
		}
		// The control focuses the input in response to `invalid`, so hand focus back.
		const previouslyFocused = input.ownerDocument.activeElement;
		input.dispatchEvent( new Event( 'invalid', { cancelable: true } ) );
		if ( previouslyFocused instanceof HTMLElement && previouslyFocused !== document.body ) {
			previouslyFocused.focus();
		} else {
			input.blur();
		}
		// Only on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

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
}
