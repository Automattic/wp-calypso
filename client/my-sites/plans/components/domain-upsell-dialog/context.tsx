import { createContext, useContext } from '@wordpress/element';

interface DomainUpsellContext {
	visible: boolean;
}

const DomainUpsellContext = createContext< DomainUpsellContext >( {} as DomainUpsellContext );

const DomainUpsellContextProvider: React.FunctionComponent< DomainUpsellContext > = ( {
	visible,
	children,
} ) => {
	return (
		<DomainUpsellContext.Provider value={ { visible } }>{ children }</DomainUpsellContext.Provider>
	);
};

export const useTourKitContext = (): DomainUpsellContext => useContext( DomainUpsellContext );

export default DomainUpsellContextProvider;
