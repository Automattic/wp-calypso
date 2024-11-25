import { createContext, useContext, useState } from '@wordpress/element';

interface HeaderPriceContext {
	isAnyPlanPriceDiscounted: boolean;
	setIsAnyPlanPriceDiscounted: ( isAnyPlanPriceDiscounted: boolean ) => void;
}

const HeaderPriceContext = createContext< HeaderPriceContext >( {} as HeaderPriceContext );

const HeaderPriceContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ isAnyPlanPriceDiscounted, setIsAnyPlanPriceDiscounted ] = useState( false );

	return (
		<HeaderPriceContext.Provider
			value={ { isAnyPlanPriceDiscounted, setIsAnyPlanPriceDiscounted } }
		>
			{ children }
		</HeaderPriceContext.Provider>
	);
};

export const useHeaderPriceContext = (): HeaderPriceContext => useContext( HeaderPriceContext );

export default HeaderPriceContextProvider;
