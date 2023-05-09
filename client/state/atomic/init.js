import { registerReducer } from 'calypso/state/redux-store';
import software from './software/reducer';
import transfers from './transfers/reducer';

registerReducer( [ 'atomicTransfers' ], transfers );
registerReducer( [ 'atomicSoftware' ], software );
