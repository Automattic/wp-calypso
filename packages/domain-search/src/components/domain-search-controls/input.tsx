import { SearchControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import './input.scss';

export const DomainSearchControlsInput = ( {
	value,
	label,
	onChange,
	onReset,
	autoFocus,
	onBlur,
	minLength,
	maxLength,
	dir,
	'aria-describedby': ariaDescribedBy,
}: {
	value: string;
	label: string;
	onChange: ( value: string ) => void;
	onReset: () => void;
	autoFocus: boolean;
	onBlur: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	minLength: number;
	maxLength: number;
	dir: 'ltr' | 'rtl';
	'aria-describedby': string;
} ) => {
	const { __ } = useI18n();

	return (
		<SearchControl
			className="domain-search-controls__input"
			__nextHasNoMarginBottom
			hideLabelFromVision
			placeholder={ __( 'Search…' ) }
			value={ value }
			label={ label }
			onChange={ onChange }
			onReset={ onReset }
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus={ autoFocus }
			onBlur={ onBlur }
			minLength={ minLength }
			maxLength={ maxLength }
			dir={ dir }
			aria-describedby={ ariaDescribedBy }
		/>
	);
};
