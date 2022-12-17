import { registerReducer } from 'calypso/state/redux-store';
import hostingReducer from './reducer';

registerReducer( [ 'edgeCache' ], hostingReducer );
