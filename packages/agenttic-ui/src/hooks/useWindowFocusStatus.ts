import { useEffect, useState } from 'react';

/**
 * Hook to track window focus status
 * @returns boolean indicating if the window is currently focused
 */
export function useWindowFocusStatus(): boolean {
	const [ isWindowFocused, setIsWindowFocused ] = useState( true );

	useEffect( () => {
		const handleFocus = () => setIsWindowFocused( true );
		const handleBlur = () => setIsWindowFocused( false );

		window.addEventListener( 'focus', handleFocus );
		window.addEventListener( 'blur', handleBlur );

		return () => {
			window.removeEventListener( 'focus', handleFocus );
			window.removeEventListener( 'blur', handleBlur );
		};
	}, [] );

	return isWindowFocused;
}
