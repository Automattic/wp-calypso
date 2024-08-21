import { localize, translate } from 'i18n-calypso';
import FormSelect from 'calypso/components/forms/form-select';
import { useRef, type FC } from 'react';
import './styles.scss';

export type CardNetworkSelectProps = {
	cardNetworks: string[];
	className?: string;
	changeBrand: ( brand: string ) => void;
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
	disabled,
	name,
	id,
	value,
	required,
	multiple,
	size,
} ) => {
	const inputRef = useRef< HTMLSelectElement | null >( null );

	if ( ! cardNetworks ) {
		return;
	}

	const getNetworkOptions = (): OptionObject[] => {
		return cardNetworks.map( ( network, idx ) => ( {
			key: idx,
			brand: network,
			disabled: ! network,
		} ) );
	};
	const options = getNetworkOptions();

	const toTitleCase = ( str: string ) => {
		return str
			.split( '_' )
			.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase() )
			.join( ' ' );
	};

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
					{ translate( toTitleCase( option.brand ) ) }
				</option>
			) ) }
		</FormSelect>
	);
};

export default localize( CardNetworkSelect );
