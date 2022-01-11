import { registerReducer } from 'calypso/state/redux-store';
import introOffersReducers from './reducers';

registerReducer( [ 'introOffers' ], introOffersReducers );
