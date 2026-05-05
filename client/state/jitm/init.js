import { registerReducer } from 'calypso/state/redux-store';
import reducer from './reducer';

if ( typeof window !== 'undefined' ) {
	registerReducer( [ 'jitm' ], reducer );
}
