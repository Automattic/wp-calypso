import { PlansIntent } from '@automattic/plans-grid-next';

export function playgroundPlansIntent(): PlansIntent | null {
	return window.localStorage.getItem( 'playground-plans-intent' ) as PlansIntent | null;
}
