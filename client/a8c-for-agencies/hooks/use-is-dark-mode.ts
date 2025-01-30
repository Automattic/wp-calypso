import { useState, useEffect } from 'react';

export const useIsDarkMode = () => {
	const [ isDarkMode, setIsDarkMode ] = useState(
		window.matchMedia( '(prefers-color-scheme: dark)' ).matches
	);

	useEffect( () => {
		const mediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
		const handleChange = ( e: MediaQueryListEvent ) => {
			setIsDarkMode( e.matches );
		};

		// Modern browsers
		mediaQuery.addEventListener( 'change', handleChange );

		return () => {
			mediaQuery.removeEventListener( 'change', handleChange );
		};
	}, [] );

	return isDarkMode;
};
