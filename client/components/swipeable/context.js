import { createContext } from 'react';

const SwipeableContext = createContext( { isInCurrentPage: false } );

const SwipeableProvider = ( { children, isInCurrentPage } ) => (
	<SwipeableContext.Provider value={ { isInCurrentPage } }>{ children }</SwipeableContext.Provider>
);

export { SwipeableContext, SwipeableProvider };
