/**
 * External Dependencies
 */
import config from 'config';

/**
 * Internal Dependencies
 */
import FluxButton from './flux';
import ReduxButton from './redux';

module.exports = config.isEnabled( 'reader/following-manage-refresh' )
   ? ReduxButton
   : FluxButton;
