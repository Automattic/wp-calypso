import { useInstanceId } from '@wordpress/compose';
import { useEffect } from 'react';
import { navigationStore } from './navigation-blocker-store';

export function NavigationBlocker( {
	shouldBlock,
	message,
}: {
	shouldBlock: boolean;
	message?: string;
} ) {
	const id = useInstanceId( NavigationBlocker, 'navigation-blocker' );

	useEffect( () => {
		if ( shouldBlock ) {
			navigationStore.set( id, message );
		} else {
			navigationStore.delete( id );
		}

		return () => {
			navigationStore.delete( id );
		};
	}, [ shouldBlock, id, message ] );

	return null;
}
