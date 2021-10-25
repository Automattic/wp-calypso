import { registerReducer } from 'calypso/state/redux-store';
import userLicensingReducer from './reducer';

registerReducer( [ 'userLicensing' ], userLicensingReducer );
