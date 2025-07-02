import { useEffect } from 'react';

export const useClickOutside = ( {
	ref,
	callback,
	isEnabled,
}: {
	ref: React.RefObject< HTMLElement >;
	callback: () => void;
	isEnabled: boolean;
} ) => {
	useEffect( () => {
		if ( ! isEnabled ) {
			return;
		}

		const handleClickOutside = ( event: MouseEvent ) => {
			if ( ref.current && ! ref.current.contains( event.target as Node ) ) {
				callback();
			}
		};

		document.addEventListener( 'mousedown', handleClickOutside );

		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [ isEnabled, callback, ref ] );
};
