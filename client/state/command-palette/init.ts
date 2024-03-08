import { registerReducer } from 'calypso/state/redux-store';
import reducer from './reducers';

registerReducer( [ 'commandPalette' ], reducer );
