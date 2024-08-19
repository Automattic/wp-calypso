import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import FormSelect from 'calypso/components/forms/form-select';
import type { FC } from 'react';

export type CardNetworkSelectProps = {
	cardNetworks: { brand: string }[];
	className?: string;
	onChange?: ( event: React.ChangeEvent< HTMLSelectElement > ) => void;
	disabled?: boolean;
};

export type OptionObject = {
	key: string | number;
	brand?: string;
	disabled?: boolean;
};

export const CardNetworkSelect: FC< CardNetworkSelectProps > = ( {
	cardNetworks,
	className,
	onChange,
	disabled,
} ) => {
	const getOptions = (): OptionObject[] => {
		if ( ! cardNetworks?.length ) {
			return [
				{
					key: '',
					brand: translate( 'Loading…' ),
					disabled: ! cardNetworks,
				},
			];
		}

		return cardNetworks.map( ( network, idx ) => ( {
			key: idx,
			brand: network.brand,
			disabled: ! network.brand,
		} ) );
	};

	const options = getOptions();

	return (
		<FormSelect
			className={ clsx( className, 'form-network-select' ) }
			onChange={ onChange }
			disabled={ disabled }
		>
			{ options.map( ( option ) => {
				return (
					<option key={ option.key } value={ option.brand } disabled={ option.disabled }>
						{ option.brand }
					</option>
				);
			} ) }
		</FormSelect>
	);
};

export default localize( CardNetworkSelect );
