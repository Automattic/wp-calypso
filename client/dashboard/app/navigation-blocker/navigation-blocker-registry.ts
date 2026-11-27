import { useBlocker } from '@tanstack/react-router';
import { navigationStore } from './navigation-blocker-store';

export function NavigationBlockerRegistry() {
	useBlocker( {
		enableBeforeUnload: () => navigationStore.getSnapshot().shouldBlock,
		shouldBlockFn: () => ! navigationStore.confirmLeave(),
	} );

	return null;
}
