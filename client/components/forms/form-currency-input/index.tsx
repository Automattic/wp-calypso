import './style.scss';
import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { ChangeEvent } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';

interface FormCurrencyInputProps extends React.SelectHTMLAttributes< HTMLInputElement > {
	className?: string;
	currencyList?: Currency[];
	currencySymbolPrefix: string;
	currencySymbolSuffix?: string;
	id: string;
	name: string;
	noWrap?: boolean;
	placeholder: string;
	value?: number;

	onCurrencyChange?: ( event: ChangeEvent< HTMLSelectElement > ) => void;
}

interface Currency {
	code: string;
	label?: string;
}

export default function FormCurrencyInput( props: FormCurrencyInputProps ): JSX.Element {
	const {
		className,
		currencySymbolPrefix,
		currencySymbolSuffix,
		onCurrencyChange,
		currencyList,
		placeholder = '0.00',
		...inputProps
	} = props;

	return (
		<FormTextInputWithAffixes
			{ ...inputProps }
			className={ clsx( 'form-currency-input', className ) }
			prefix={ renderAffix( currencySymbolPrefix, onCurrencyChange, currencyList ) }
			suffix={ renderAffix( currencySymbolSuffix, onCurrencyChange, currencyList ) }
			type="number"
			step={ currencySymbolPrefix === 'JPY' ? '1' : '0.01' }
			placeholder={ placeholder }
			value={ props.value || null }
		/>
	);
}

function renderAffix(
	currencySymbol: string | undefined,
	onCurrencyChange: ( ( event: ChangeEvent< HTMLSelectElement > ) => void ) | undefined,
	currencyList: Currency[] | undefined
): JSX.Element | null {
	// If the currency symbol is not defined, don't render this affix at all
	if ( ! currencySymbol ) {
		return null;
	}

	// If the currency is not editable, i.e., when `currencyList` is not defined, then just
	// render the plain value.
	if ( ! currencyList ) {
		return <>{ currencySymbol }</>;
	}

	// Find the currency code in the `currencyList` and return the label. If not found, use the code itself as the label.
	const currencyLabel =
		currencyList.find( ( currency ) => currency.code === currencySymbol )?.label ?? currencySymbol;

	// For an editable currency, display a <FormSelect> overlay
	return (
		<span className="form-currency-input__affix">
			{ currencyLabel }
			<Gridicon icon="chevron-down" size={ 18 } className="form-currency-input__select-icon" />
			<FormSelect
				className="form-currency-input__select"
				value={ currencySymbol }
				onChange={ onCurrencyChange }
				onBlur={ onCurrencyChange }
			>
				{ currencyList.map( ( { code, label = code } ) => (
					<option key={ code } value={ code }>
						{ label }
					</option>
				) ) }
			</FormSelect>
		</span>
	);
}
