import { SearchControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { forwardRef } from 'react';
import './input.scss';

interface DomainSearchControlsInputProps {
	value: string;
	label?: string;
	placeholder?: string;
	onChange: ( value: string ) => void;
	onReset?: () => void;
	autoFocus?: boolean;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	minLength?: number;
	maxLength?: number;
	dir?: 'ltr' | 'rtl';
	'aria-describedby'?: string;
}

export const DomainSearchControlsInput = forwardRef<
	HTMLInputElement,
	DomainSearchControlsInputProps
>( function DomainSearchControlsInput(
	{
		value,
		label,
		placeholder,
		onChange,
		onReset,
		autoFocus,
		onBlur,
		onKeyDown,
		minLength,
		maxLength,
		dir,
		'aria-describedby': ariaDescribedBy,
	},
	ref
) {
	const { __ } = useI18n();

	return (
		<SearchControl
			ref={ ref }
			className="domain-search-controls__input"
			__nextHasNoMarginBottom
			hideLabelFromVision
			placeholder={ placeholder ?? __( 'Search…' ) }
			value={ value }
			label={ label ?? __( 'Search' ) }
			onChange={ onChange }
			onReset={ onReset }
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus={ autoFocus }
			onBlur={ onBlur }
			onKeyDown={ onKeyDown }
			minLength={ minLength }
			maxLength={ maxLength }
			dir={ dir }
			aria-describedby={ ariaDescribedBy }
		/>
	);
} );
