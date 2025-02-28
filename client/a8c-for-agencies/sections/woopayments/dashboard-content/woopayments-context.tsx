import { createContext, useContext } from '@wordpress/element';

interface WooPaymentsContextType {
	woopaymentsData: any;
	isLoadingWooPaymentsData: boolean;
}

const WooPaymentsContext = createContext< WooPaymentsContextType | undefined >( undefined );

export const useWooPaymentsContext = () => {
	const context = useContext( WooPaymentsContext );
	if ( context === undefined ) {
		throw new Error( 'useWooPaymentsContext must be used within a WooPaymentsProvider' );
	}
	return context;
};

interface WooPaymentsProviderProps {
	children: React.ReactNode;
	value: WooPaymentsContextType;
}

export const WooPaymentsProvider = ( { children, value }: WooPaymentsProviderProps ) => {
	return <WooPaymentsContext.Provider value={ value }>{ children }</WooPaymentsContext.Provider>;
};
