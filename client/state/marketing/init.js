import { registerReducer } from 'calypso/state/redux-store';
import marketingReducer from './reducer';

registerReducer( [ 'marketing' ], marketingReducer );
