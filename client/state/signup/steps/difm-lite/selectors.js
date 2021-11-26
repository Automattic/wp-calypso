import 'calypso/state/signup/init';
import { defaultValue } from './reducer';

export function getDIFMLiteState( state ) {
	return state?.signup?.steps?.difmLite ?? defaultValue;
}

export function getSelectedCategory( state ) {
	return state?.signup?.steps?.difmLite?.selectedDIFMCategory ?? '';
}
