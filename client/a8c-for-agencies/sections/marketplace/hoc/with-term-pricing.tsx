import { ComponentType, useState } from 'react';
import { TermPricingContext } from '../context';
import { TermPricingType } from '../types';

type ContextProps = {
	defaultTermPricing?: TermPricingType;
};

export const TERM_PRICING_SESSION_STORAGE_KEY = 'term-pricing';
export const TERM_PRICING_MONTHLY = 'monthly';
export const TERM_PRICING_YEARLY = 'yearly';

function withTermPricing< T >(
	WrappedComponent: ComponentType< T & ContextProps >
): ComponentType< T & ContextProps > {
	const WithTermPricing = ( props: T & ContextProps ) => {
		const defaultType =
			props.defaultTermPricing ??
			( sessionStorage.getItem( TERM_PRICING_SESSION_STORAGE_KEY ) as TermPricingType ) ??
			TERM_PRICING_YEARLY;

		const [ termPricing, setTermPricing ] = useState( defaultType );

		const updateTermPricing = ( type: TermPricingType ) => {
			sessionStorage.setItem( TERM_PRICING_SESSION_STORAGE_KEY, type );
			setTermPricing( type );
		};

		const toggleTermPricing = () => {
			const nextType =
				termPricing === TERM_PRICING_MONTHLY ? TERM_PRICING_YEARLY : TERM_PRICING_MONTHLY;
			updateTermPricing( nextType );
		};

		return (
			<TermPricingContext.Provider
				value={ {
					termPricing,
					setTermPricing: updateTermPricing,
					toggleTermPricing,
				} }
			>
				<WrappedComponent { ...props } />
			</TermPricingContext.Provider>
		);
	};

	WithTermPricing.displayName = `WithTermPricing(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;

	return WithTermPricing;
}

export default withTermPricing;
