import { speak } from '@wordpress/a11y';
import { Icon } from '@wordpress/components';
import { caution } from '@wordpress/icons';
import { cloneElement, forwardRef, useRef, useState } from 'react';

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
		onSetCustomValidityTarget = ( refElement ) => refElement.current,
		render,
		...props
	}: {
		onReportCustomValidity?: () => string | void;
		onSetCustomValidityTarget?: (
			refElement: React.MutableRefObject< HTMLElement | null >
		) => ValidityTarget | null | undefined;
		render: C;
	},
	forwardedRef: React.ForwardedRef< HTMLDivElement >
) {
	const [ errorMessage, setErrorMessage ] = useState< string | undefined >();
	const [ isTouched, setIsTouched ] = useState( false );
	const ref = useRef( null );

	const validate = () => {
		// TODO: Fix this
		const message = onReportCustomValidity?.();
		const validityTarget = onSetCustomValidityTarget( ref );
		validityTarget?.setCustomValidity?.( message ?? '' );

		const newErrorMessage = validityTarget?.validationMessage ?? '';

		setErrorMessage( newErrorMessage );

		if ( newErrorMessage ) {
			speak( newErrorMessage );
		}
	};

	const onBlur = ( ...args ) => {
		setIsTouched( true );

		validate();

		// Workaround for setCustomValidity() forcing an immediate re-render,
		// which can reset the field value in uncontrolled mode.
		const previousValue = ref.current?.value;
		setTimeout( () => {
			if ( ref.current ) {
				ref.current.value = previousValue ?? '';
			}
		}, 0 );

		render.props.onBlur?.( ...args );
	};

	const onChange = ( ...args ) => {
		render.props.onChange?.( ...args );

		// Only validate incrementally if the value is already marked as invalid.
		if ( isTouched ) {
			validate();
		}
	};

	const label = render.props.required ? `${ render.props.label } (Required)` : render.props.label;

	return (
		<div className="a8c-use-validation" ref={ forwardedRef }>
			{ cloneElement( render, {
				...props,
				label,
				onBlur,
				onChange,
				ref,
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
