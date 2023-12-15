import { registerReducer } from 'calypso/state/redux-store';
import stagingSiteReducer from './reducer';

registerReducer( [ 'stagingSite' ], stagingSiteReducer );
