import { registerReducer } from 'calypso/state/redux-store';
import introOffersReducers from './reducer';

registerReducer( [ 'introOffers' ], introOffersReducers );
