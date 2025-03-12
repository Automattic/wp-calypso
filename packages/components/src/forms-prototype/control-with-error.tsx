import { speak } from '@wordpress/a11y';
import { Icon } from '@wordpress/components';
import { caution } from '@wordpress/icons';
import { cloneElement, forwardRef, useState } from 'react';

/**
 * HTML elements that support the Constraint Validation API.
 * @see https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
 */
type ValidityTarget =
	| HTMLButtonElement
	| HTMLFieldSetElement
	| HTMLInputElement
	| HTMLSelectElement
	| HTMLTextAreaElement;

function UnforwardedControlWithError< C extends React.ReactElement >(
	{
		onReportCustomValidity,
		getValidityTarget,
		render,
		...props
	}: {
		onReportCustomValidity?: () => string | void;
		getValidityTarget: () => ValidityTarget | null | undefined;
		render: C;
	},
	forwardedRef: React.ForwardedRef< HTMLDivElement >
) {
	const [ errorMessage, setErrorMessage ] = useState< string | undefined >();
	const [ isTouched, setIsTouched ] = useState( false );

	const validate = () => {
		const message = onReportCustomValidity?.();
		const validityTarget = getValidityTarget?.();
		validityTarget?.setCustomValidity?.( message ?? '' );

		const newErrorMessage = validityTarget?.validationMessage ?? '';

		setErrorMessage( newErrorMessage );

		if ( newErrorMessage ) {
			speak( newErrorMessage );
		}
	};

	const onBlur = ( event: React.FocusEvent< HTMLDivElement > ) => {
		// Only consider the blur event if focus has fully left the wrapping div.
		if ( event.relatedTarget && event.currentTarget.contains( event.relatedTarget ) ) {
			return;
		}

		setIsTouched( true );

		validate();

		// Workaround for setCustomValidity() forcing an immediate re-render,
		// which can reset the text field value in uncontrolled mode.
		const validityTarget = getValidityTarget?.();
		if (
			validityTarget instanceof HTMLInputElement &&
			[ 'text', 'number' ].includes( validityTarget.type )
		) {
			const correctValue = validityTarget.value;
			setTimeout( () => {
				validityTarget.value = correctValue ?? '';
			}, 0 );
		}
	};

	const onChange = ( ...args: unknown[] ) => {
		render.props.onChange?.( ...args );

		// Only validate incrementally if the value is already marked as invalid.
		if ( isTouched ) {
			validate();
		}
	};

	const label = render.props.required ? `${ render.props.label } (Required)` : render.props.label;

	return (
		<div className="a8c-use-validation" ref={ forwardedRef } onBlur={ onBlur }>
			{ cloneElement( render, {
				...props,
				label,
				onChange,
			} ) }
			{ errorMessage && (
				<p className="a8c-use-validation__error">
					<Icon
						className="a8c-use-validation__error-icon"
						icon={ caution }
						size={ 16 }
						fill="currentColor"
					/>
					{ errorMessage }
				</p>
			) }
		</div>
	);
}

export const ControlWithError = forwardRef( UnforwardedControlWithError );
