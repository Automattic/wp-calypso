import { useBlocker } from '@tanstack/react-router';
import { confirmLeave } from './leave-page';
import { navigationStore } from './navigation-blocker-store';

export function NavigationBlockerRegistry() {
	// Both read the store when they run rather than when this renders, so `leavePage()`
	// skips the prompt for a page load it starts in the same task.
	useBlocker( {
		enableBeforeUnload: () => navigationStore.shouldBlockBeforeUnload(),
		shouldBlockFn: () => ! confirmLeave(),
	} );

	return null;
}
