import 'calypso/state/ui/init';

export function isSignupInitializing( state: any ): boolean {
	return state.ui.signupIsInitializing;
}
