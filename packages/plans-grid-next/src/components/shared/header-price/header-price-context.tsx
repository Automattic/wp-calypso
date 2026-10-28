import { createContext, useCallback, useContext, useState } from '@wordpress/element';

interface HeaderPriceContext {
	isAnyPlanPriceDiscounted: boolean;
	setIsPlanPriceDiscounted: ( planSlug: string, isDiscounted: boolean ) => void;
}

const HeaderPriceContext = createContext< HeaderPriceContext >( {} as HeaderPriceContext );

const HeaderPriceContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ discountedPlans, setDiscountedPlans ] = useState( () => new Set< string >() );
	const setIsPlanPriceDiscounted = useCallback( ( planSlug: string, isDiscounted: boolean ) => {
		setDiscountedPlans( ( current ) => {
			if ( current.has( planSlug ) === isDiscounted ) {
				return current;
			}
			const next = new Set( current );
			if ( isDiscounted ) {
				next.add( planSlug );
			} else {
				next.delete( planSlug );
			}
			return next;
		} );
	}, [] );

	return (
		<HeaderPriceContext.Provider
			value={ { isAnyPlanPriceDiscounted: discountedPlans.size > 0, setIsPlanPriceDiscounted } }
		>
			{ children }
		</HeaderPriceContext.Provider>
	);
};

export const useHeaderPriceContext = (): HeaderPriceContext => useContext( HeaderPriceContext );

export default HeaderPriceContextProvider;
