import { registerReducer } from 'calypso/state/redux-store';
import transfers from './transfers/reducer';

registerReducer( [ 'atomicTransfers' ], transfers );
