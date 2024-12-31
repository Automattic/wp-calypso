import { useState, useEffect } from 'react';

const useLocalStorage = ( key: string, initialValue: string = '' ) => {
	const [ storedValue, setStoredValue ] = useState( () => {
		try {
			const item = localStorage.getItem( key );
			return item ? JSON.parse( item ) : initialValue;
		} catch ( error ) {
			return initialValue;
		}
	} );

	useEffect( () => {
		try {
			localStorage.setItem( key, JSON.stringify( storedValue ) );
		} catch ( error ) {}
	}, [ key, storedValue ] );

	return [ storedValue, setStoredValue ];
};

export default useLocalStorage;
