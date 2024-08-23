import { localize } from 'i18n-calypso';
import { useRef, type FC } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import './styles.scss';

export type CardNetworkSelectProps = {
	cardNetworks: string[];
	className?: string;
	changeBrand: ( brand: string ) => void;
	changePreferredNetwork: ( preferredNetwork: string ) => void;
	disabled?: boolean;
	name?: string;
	id?: string;
	value?: string;
	required?: boolean;
	multiple?: boolean;
	size?: number;
};

export type OptionObject = {
	key: string | number;
	brand: string;
	disabled: boolean;
};

export const CardNetworkSelect: FC< CardNetworkSelectProps > = ( {
	cardNetworks,
	className,
	changeBrand,
	changePreferredNetwork,
	disabled,
	name,
	id,
	value,
	required,
	multiple,
	size,
} ) => {
	const inputRef = useRef< HTMLSelectElement | null >( null );
	const toTitleCase = ( str: string ) => {
		return str
			.split( '_' )
			.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase() )
			.join( ' ' );
	};

	if ( ! cardNetworks ) {
		return;
	}

	const getNetworkOptions = (): OptionObject[] => {
		return cardNetworks.map( ( network, idx ) => ( {
			key: idx,
			brand: toTitleCase( network ),
			disabled: ! network,
		} ) );
	};
	const options = getNetworkOptions();

	return (
		<FormSelect
			className={ className }
			onFocus={ ( input ) => {
				input.stopPropagation();
				if ( inputRef.current ) {
					inputRef.current.focus();
				}
			} }
			onChange={ ( input ) => {
				changeBrand( input?.currentTarget.value );
				changePreferredNetwork( input?.currentTarget.value );
			} }
			disabled={ disabled }
			name={ name }
			id={ id }
			value={ value }
			required={ required }
			multiple={ multiple }
			size={ size }
			inputRef={ inputRef }
		>
			{ options.map( ( option ) => (
				<option key={ option.key } value={ option.brand } disabled={ option.disabled }>
					{ option.brand }
				</option>
			) ) }
		</FormSelect>
	);
};

export default localize( CardNetworkSelect );
