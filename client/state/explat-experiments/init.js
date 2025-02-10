import { registerReducer } from 'calypso/state/redux-store';
import reducers from './reducers';

registerReducer( [ 'explatExperiments' ], reducers );
