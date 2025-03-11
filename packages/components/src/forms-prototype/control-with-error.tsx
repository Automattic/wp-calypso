import { Icon } from '@wordpress/components';
import { caution } from '@wordpress/icons';
import { cloneElement, useRef, useState } from 'react';

export function ControlWithError< C extends React.ReactElement >( {
	onReportCustomValidity,
	render,
	...props
}: {
	onReportCustomValidity?: ( value: string ) => string | void;
	render: C;
} ) {
	const [ errorMessage, setErrorMessage ] = useState< string | undefined >();
	const [ isTouched, setIsTouched ] = useState( false );
	const ref = useRef< HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement >( null );

	const validate = () => {
		if ( ! ref.current ) {
			return;
		}

		const message = onReportCustomValidity?.( ref.current.value );
		ref.current.setCustomValidity?.( message ?? '' );

		setErrorMessage( ref.current.validationMessage );
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
		// Only validate incrementally if the value is already marked as invalid.
		if ( isTouched ) {
			validate();
		}

		render.props.onChange?.( ...args );
	};

	const label = render.props.required ? (
		<>
			{ render.props.label } <span aria-hidden="true">(Required)</span>
		</>
	) : (
		render.props.label
	);

	return (
		<div className="a8c-use-validation">
			{ cloneElement( render, {
				...props,
				label,
				onBlur,
				onChange,
				ref,
			} ) }
			{ errorMessage && (
				<p className="a8c-use-validation__error">
					<Icon icon={ caution } size={ 16 } fill="currentColor" />
					{ errorMessage }
				</p>
			) }
		</div>
	);
}
