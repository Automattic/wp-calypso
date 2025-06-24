import { PlansIntent } from '@automattic/plans-grid-next';
import { DEFAULT_PLAN_INTENT } from '../index';

export function playgroundPlansIntent( playgroundId: string ): PlansIntent {
	return ( window.localStorage.getItem( 'playground-plans-intent' + playgroundId ) ??
		DEFAULT_PLAN_INTENT ) as PlansIntent;
}
