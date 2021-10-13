import { registerReducer } from 'calypso/state/redux-store';
import loginReducer from './reducer';

import 'calypso/state/login/init';

registerReducer( [ 'login' ], loginReducer );
