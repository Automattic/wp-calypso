import { registerReducer } from 'calypso/state/redux-store';
import { softwareReducer } from './software';
import { transfersReducer } from './transfers';

// registerReducer( [ 'atomicTransfers' ], transfersReducer );

// import software from './software/reducer';
// import transfers from './transfers/reducer';
// registerReducer( [ 'atomicTransfers' ], transfers );
// registerReducer( [ 'atomicSoftware' ], software );
