import { registerReducer } from 'calypso/state/redux-store';
import akismetKeyReducer from './reducer';

registerReducer( [ 'akismetKey' ], akismetKeyReducer );
