import { get } from 'lodash';

import 'calypso/state/signup/init';

export function getDesignType( state ) {
	return get( state, 'signup.steps.designType', '' );
}
