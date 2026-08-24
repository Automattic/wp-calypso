import 'calypso/state/signup/init';

export function getDesignType( state ) {
	return state?.signup?.steps?.designType ?? '';
}
