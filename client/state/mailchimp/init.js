/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import mailchimpReducer from './reducer';

registerReducer( [ 'mailchimp' ], mailchimpReducer );
