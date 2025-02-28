import { createContext, useContext } from '@wordpress/element';
import type { SitesWithWooPaymentsState, WooPaymentsData } from './types';

interface WooPaymentsContextType {
	woopaymentsData: WooPaymentsData;
	isLoadingWooPaymentsData: boolean;
	sitesWithPluginsStates: SitesWithWooPaymentsState[];
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
