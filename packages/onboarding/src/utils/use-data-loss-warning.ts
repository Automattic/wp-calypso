import { useEffect } from 'react';

export function useDataLossWarning( enabled: boolean ) {
	useEffect( () => {
		const handleBeforeUnload = ( event: BeforeUnloadEvent ) => {
			event.preventDefault();
			event.returnValue = '';
		};
		if ( enabled ) {
			window.addEventListener( 'beforeunload', handleBeforeUnload );

			return () => {
				window.removeEventListener( 'beforeunload', handleBeforeUnload );
			};
		}
	}, [ enabled ] );
}
