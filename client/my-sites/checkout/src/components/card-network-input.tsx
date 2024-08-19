import { PaymentLogo } from '@automattic/wpcom-checkout';
import clsx from 'clsx';
import { FC, useState } from 'react';
import CardNetworkSelect from './card-network-select';

export type CardNetworkInputProps = {
	className?: string;
	disabled?: boolean;
	cardNetworks: { brand: string }[];
};

export const CardNetworkInput: FC< CardNetworkInputProps > = ( {
	className,
	disabled,
	cardNetworks,
} ) => {
	const [ selectedNetwork, setSelectedNetwork ] = useState( 'unknown' );

	const handleNetworkSelection = ( event ) => {
		setSelectedNetwork( event.target.value );
	};

	return (
		<div className="card-network-input__select-container">
			<div className="card-network-input__select-inner-container">
				<CardNetworkSelect
					className={ clsx( className, 'card-network-input__brand-select' ) }
					onChange={ handleNetworkSelection }
					cardNetworks={ cardNetworks }
					disabled={ disabled }
				/>
				<PaymentLogo brand={ selectedNetwork } />
			</div>
		</div>
	);
};
