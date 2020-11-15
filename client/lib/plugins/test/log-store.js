/**
 * External dependencies
 */
import Dispatcher from 'calypso/dispatcher';

/**
 * Internal dependencies
 */
import actions from './fixtures/actions';
import LogStore from '../log-store';

describe( 'Plugins Log Store', () => {
	test( 'logs an update error', () => {
		const initialErrors = LogStore.getErrors().length;
		Dispatcher.handleServerAction( actions.updatedPluginError );
		expect( LogStore.getErrors() ).toHaveLength( initialErrors + 1 );
	} );

	test( 'removing error notices clears the error log', () => {
		Dispatcher.handleServerAction( actions.removeErrorNotices );
		expect( LogStore.getErrors() ).toHaveLength( 0 );
	} );
} );
