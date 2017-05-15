/**
 * External Dependencies
 */
import config from 'config';

/**
 * Internal Dependencies
 */
import FluxButton from './flux';
import ReduxButton from './redux';

export default ( config.isEnabled( 'reader/following-manage-refresh' ) ? ReduxButton : FluxButton );
