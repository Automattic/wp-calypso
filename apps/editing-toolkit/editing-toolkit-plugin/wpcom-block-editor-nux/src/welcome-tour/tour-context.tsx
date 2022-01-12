import { createContext, useContext } from '@wordpress/element';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WelcomeTourContext {}

const WelcomeTourContext = createContext< Partial< WelcomeTourContext > >( {} );

export const WelcomeTourContextProvider: React.FunctionComponent = ( { children } ) => {
	return <WelcomeTourContext.Provider value={ {} }>{ children }</WelcomeTourContext.Provider>;
};

export const useWelcomeTourContext = () => useContext( WelcomeTourContext );
