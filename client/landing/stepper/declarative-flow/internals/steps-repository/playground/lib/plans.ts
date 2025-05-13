import { PlansIntent } from '@automattic/plans-grid-next';

export function playgroundPlansIntent( playgroundId: string ): PlansIntent {
	return ( window.localStorage.getItem( 'playground-plans-intent' + playgroundId ) ??
		'plans-playground' ) as PlansIntent;
}
