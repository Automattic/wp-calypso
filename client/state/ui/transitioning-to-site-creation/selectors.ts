import 'calypso/state/ui/init';

export function isTransitioningToSiteCreation( state: any ): boolean {
	return state.ui.transitioningToSiteCreation;
}
