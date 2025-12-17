import { ComponentType, useCallback, useMemo } from 'react';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';
import { TermPricingContext } from '../context';
import { TermPricingType } from '../types';

type ContextProps = {
	defaultTermPricing?: TermPricingType;
};

export const TERM_PRICING_PREFERENCE_KEY = 'a4a-marketplace-term-pricing';
export const TERM_PRICING_MONTHLY = 'monthly';
export const TERM_PRICING_YEARLY = 'yearly';

function withTermPricing< T >(
	WrappedComponent: ComponentType< T & ContextProps >
): ComponentType< T & ContextProps > {
	const WithTermPricing = ( props: T & ContextProps ) => {
		const defaultTermPricing = props.defaultTermPricing ?? TERM_PRICING_YEARLY;

		const [ termPricingValue, updateTermPricing ] = useAsyncPreference< TermPricingType >( {
			defaultValue: defaultTermPricing,
			preferenceName: TERM_PRICING_PREFERENCE_KEY,
		} );

		// Handle async loading - use default until preference is loaded
		const termPricing: TermPricingType =
			termPricingValue === 'none' ? defaultTermPricing : termPricingValue;

		const toggleTermPricing = useCallback( () => {
			const nextType =
				termPricing === TERM_PRICING_MONTHLY ? TERM_PRICING_YEARLY : TERM_PRICING_MONTHLY;
			updateTermPricing( nextType );
		}, [ termPricing, updateTermPricing ] );

		const contextValue = useMemo(
			() => ( {
				termPricing,
				setTermPricing: updateTermPricing,
				toggleTermPricing,
			} ),
			[ termPricing, updateTermPricing, toggleTermPricing ]
		);

		return (
			<TermPricingContext.Provider value={ contextValue }>
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
