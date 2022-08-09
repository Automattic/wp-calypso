import { registerReducer } from 'calypso/state/redux-store';
import reducer from './reducer';

registerReducer( [ 'cancellationOffers' ], reducer );
