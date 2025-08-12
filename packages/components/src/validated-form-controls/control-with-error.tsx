import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { error } from '@wordpress/icons';
import { cloneElement, forwardRef, useEffect, useState } from 'react';
import { withIgnoreIMEEvents } from '../utils/with-ignore-ime-events';

import './style.scss';

function appendRequiredIndicator(
	label: React.ReactNode,
	required: boolean | undefined,
	markWhenOptional: boolean | undefined
) {
	if ( required && ! markWhenOptional ) {
		return (
			<>
				{ label } { `(${ __( 'Required' ) })` }
			</>
		);
	}
	if ( ! required && markWhenOptional ) {
		return (
			<>
				{ label } { `(${ __( 'Optional' ) })` }
			</>
		);
	}
	return label;
}

/**
 * HTML elements that support the Constraint Validation API.
 *
 * Here, we exclude HTMLButtonElement because although it does technically support the API,
 * normal buttons are actually exempted from any validation.
 * @see https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/willValidate
 */
type ValidityTarget =
	| HTMLFieldSetElement
	| HTMLInputElement
	| HTMLSelectElement
	| HTMLTextAreaElement;

function UnforwardedControlWithError< C extends React.ReactElement >(
	{
		required,
		markWhenOptional,
		customValidator,
		getValidityTarget,
		children,
	}: {
		/**
		 * Whether the control is required.
		 */
		required?: boolean;
		/**
		 * Label the control as "optional" when _not_ `required`, instead of the inverse.
		 */
		markWhenOptional?: boolean;
		/**
		 * A function that returns a custom validity message when applicable.
		 *
		 * This message will be applied to the element returned by `getValidityTarget`.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity
		 */
		customValidator?: () => string | void;
		/**
		 * A function that returns the actual element on which the validity data should be applied.
		 */
		getValidityTarget: () => ValidityTarget | null | undefined;
		/**
		 * The control component to apply validation to.
		 */
		children: C;
	},
	forwardedRef: React.ForwardedRef< HTMLDivElement >
) {
	const [ errorMessage, setErrorMessage ] = useState< string | undefined >();
	const [ isTouched, setIsTouched ] = useState( false );

	// Ensure that error messages are visible after user attemps to submit a form
	// with multiple invalid fields.
	useEffect( () => {
		const validityTarget = getValidityTarget();
		const showValidationMessage = () => setErrorMessage( validityTarget?.validationMessage );

		validityTarget?.addEventListener( 'invalid', showValidationMessage );

		return () => {
			validityTarget?.removeEventListener( 'invalid', showValidationMessage );
		};
	} );

	const validate = () => {
		const message = customValidator?.();
		const validityTarget = getValidityTarget();

		validityTarget?.setCustomValidity( message ?? '' );
		setErrorMessage( validityTarget?.validationMessage );
	};

	const onBlur = ( event: React.FocusEvent< HTMLDivElement > ) => {
		// Only consider "blurred from the component" if focus has fully left the wrapping div.
		// This prevents unnecessary blurs from components with multiple focusable elements.
		if ( ! event.relatedTarget || ! event.currentTarget.contains( event.relatedTarget ) ) {
			setIsTouched( true );

			const validityTarget = getValidityTarget();

			// Prevents a double flash of the native error tooltip when the control is already showing one.
			if ( ! validityTarget?.validity.valid ) {
				if ( ! errorMessage ) {
					setErrorMessage( validityTarget?.validationMessage );
				}
				return;
			}

			validate();
		}
	};

	const onChange = ( ...args: unknown[] ) => {
		children.props.onChange?.( ...args );

		// Only validate incrementally if the field has blurred at least once,
		// or currently has an error message.
		if ( isTouched || errorMessage ) {
			validate();
		}
	};

	const onKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		// Ensures that custom validators are triggered when the user submits by pressing Enter,
		// without ever blurring the control.
		if ( event.key === 'Enter' ) {
			validate();
		}
	};

	return (
		// Disable reason: Just listening to a bubbled event, not for interaction.
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions
		<div
			className="a8c-validated-control"
			ref={ forwardedRef }
			onBlur={ onBlur }
			onKeyDown={ withIgnoreIMEEvents( onKeyDown ) }
		>
			{ cloneElement( children, {
				label: appendRequiredIndicator( children.props.label, required, markWhenOptional ),
				onChange,
				required,
			} ) }
			<div aria-live="polite">
				{ errorMessage && (
					<p className="a8c-validated-control__error">
						<Icon
							className="a8c-validated-control__error-icon"
							icon={ error }
							size={ 16 }
							fill="currentColor"
						/>
						{ errorMessage }
					</p>
				) }
			</div>
		</div>
	);
}

export const ControlWithError = forwardRef( UnforwardedControlWithError );
