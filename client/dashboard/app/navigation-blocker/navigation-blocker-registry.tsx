import { useBlocker } from '@tanstack/react-router';
import { useSyncExternalStore } from 'react';
import { navigationStore } from './navigation-blocker-store';

export function NavigationBlockerRegistry() {
	const { shouldBlock, message } = useSyncExternalStore(
		( callback ) => navigationStore.subscribe( callback ),
		() => navigationStore.getSnapshot()
	);

	useBlocker( {
		enableBeforeUnload: shouldBlock,
		shouldBlockFn: () => {
			if ( ! shouldBlock ) {
				return false;
			}

			return ! confirm( message );
		},
	} );

	return null;
}
