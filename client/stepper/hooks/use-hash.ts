import { useState, useEffect } from '@wordpress/element';

export function useHash() {
	const [ hash, setHash ] = useState( window.location.hash );

	useEffect( () => {
		const handleHashChange = () => {
			setHash( window.location.hash );
		};

		window.addEventListener( 'hashchange', handleHashChange );

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
		};
	}, [] );

	return hash;
}
