import { PlansIntent } from '@automattic/plans-grid-next';

export function playgroundPlansIntent( playgroundId: string ): PlansIntent | null {
	return window.localStorage.getItem(
		'playground-plans-intent' + playgroundId
	) as PlansIntent | null;
}
