import { ComponentType } from 'react';
import { MarketplaceType, TermPricingType } from '../types';
import withMarketplaceType from './with-marketplace-type';
import withTermPricing from './with-term-pricing';

type ContextProps = {
	defaultMarketplaceType?: MarketplaceType;
	defaultTermPricing?: TermPricingType;
};

/**
 * Higher-order component that provides both MarketplaceTypeContext and TermPricingContext.
 * This is a convenience wrapper that composes withMarketplaceType and withTermPricing.
 *
 * @example
 * ```tsx
 * export default withMarketplaceProviders( MyComponent );
 * ```
 */
function withMarketplaceProviders< T >(
	WrappedComponent: ComponentType< T & ContextProps >
): ComponentType< T & ContextProps > {
	// Compose the HOCs - both contexts are independent, so order doesn't matter functionally
	// This creates: MarketplaceTypeContext.Provider > TermPricingContext.Provider > WrappedComponent
	return withMarketplaceType( withTermPricing( WrappedComponent ) );
}

export default withMarketplaceProviders;
