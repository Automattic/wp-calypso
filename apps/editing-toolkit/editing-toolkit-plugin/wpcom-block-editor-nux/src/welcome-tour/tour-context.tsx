import { createContext, useState, useContext } from '@wordpress/element';

interface WelcomeTourContext {
	justMaximized: boolean;
	setJustMaximized: React.Dispatch< React.SetStateAction< boolean > >;
}

const WelcomeTourContext = createContext< Partial< WelcomeTourContext > >( {} );

export const WelcomeTourContextProvider: React.FunctionComponent = ( { children } ) => {
	const [ justMaximized, setJustMaximized ] = useState( false );

	return (
		<WelcomeTourContext.Provider value={ { justMaximized, setJustMaximized } }>
			{ children }
		</WelcomeTourContext.Provider>
	);
};

export const useWelcomeTourContext = () => useContext( WelcomeTourContext );
