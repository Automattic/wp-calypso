import 'calypso/state/signup/init';

export function getSuggestedUsername( state ) {
	return state?.signup?.optionalDependencies?.suggestedUsername ?? '';
}
