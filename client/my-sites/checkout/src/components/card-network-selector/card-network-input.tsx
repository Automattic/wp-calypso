import { PaymentLogo } from '@automattic/wpcom-checkout';
import clsx from 'clsx';
import { FC } from 'react';
import CardNetworkSelect from './card-network-select';
import './styles.scss';
import { Gridicon } from '@automattic/components';

export type CardNetworkInputProps = {
	className?: string;
	disabled?: boolean;
	cardNetworks: string[];
	changeBrand: ( brand: string ) => void;
	brand: string;
};

export const CardNetworkInput: FC< CardNetworkInputProps > = ( {
	className,
	disabled,
	cardNetworks,
	changeBrand,
	brand,
} ) => {
	return (
		<div className="card-network-input__select-container">
			<div className="card-network-input__select-inner-container">
				{ cardNetworks && (
					<CardNetworkSelect
						className={ clsx( className, 'card-network__brand-select' ) }
						changeBrand={ changeBrand }
						cardNetworks={ cardNetworks }
						value={ brand }
						disabled={ disabled }
					/>
				) }
				<div className="card-network-input__logo-container">
					<Gridicon
						icon="chevron-down"
						size={ 12 }
						className="card-network-input__logo-selector-icon"
					/>
					<PaymentLogo brand={ brand } className="card-network-input__logo-icon" />
				</div>
			</div>
		</div>
	);
};
