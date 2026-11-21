import { navigationStore } from './navigation-blocker-store';

/**
 * Asks whether to discard unsaved changes, as an in-app navigation does. Returns true when
 * nothing blocks navigation or the user agrees to leave.
 *
 * Call it before an action that leaves the page and can't be undone, such as ending the
 * session, while the user can still choose to stay and keep their changes.
 */
export function confirmLeave(): boolean {
	const { shouldBlock, message } = navigationStore.getSnapshot();
	return ! shouldBlock || window.confirm( message );
}

/**
 * Loads another page without the browser's "Leave site?" prompt, for code that can't
 * navigate through the router, such as the omnibar. Unsaved changes are lost, so only call
 * it once the user has chosen to leave, e.g. with `confirmLeave()`.
 */
export function leavePage( href: string ) {
	navigationStore.skipNextBeforeUnload();
	window.location.href = href;
}
