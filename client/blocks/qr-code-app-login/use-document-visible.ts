import { useEffect, useState } from 'react';

export function useDocumentVisible(): boolean {
	const [ isVisible, setIsVisible ] = useState(
		typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
	);

	useEffect( () => {
		const onChange = () => setIsVisible( document.visibilityState !== 'hidden' );
		document.addEventListener( 'visibilitychange', onChange );
		return () => document.removeEventListener( 'visibilitychange', onChange );
	}, [] );

	return isVisible;
}
