import { registerReducer } from 'calypso/state/redux-store';
import siteSyncReducer from './reducer';

registerReducer( [ 'siteSync' ], siteSyncReducer );
