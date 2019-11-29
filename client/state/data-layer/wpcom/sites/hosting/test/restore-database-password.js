/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	requestRestoreDatabasePassword,
	showSuccessNotification,
	showErrorNotification,
} from '../restore-database-password';
import { HOSTING_RESTORE_DATABASE_PASSWORD } from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';

describe( 'requestRestoreDatabasePassword', () => {
	it( 'should return an http action with the proper path', () => {
		const action = requestRestoreDatabasePassword( {
			type: HOSTING_RESTORE_DATABASE_PASSWORD,
			siteId: 1,
		} );
		expect( action ).toHaveProperty( 'method', 'POST' );
		expect( action ).toHaveProperty( 'path', '/sites/1/hosting/restore-database-password' );
		expect( action ).toHaveProperty( 'query.apiNamespace', 'wpcom/v2' );
	} );
} );

describe( 'showSuccessNotification', () => {
	it( 'should return a successNotice action', () => {
		const noticeAction = successNotice( translate( 'Your database password has been restored.' ), {
			duration: 5000,
			id: 'restore-database-password-success',
		} );
		expect( showSuccessNotification() ).toEqual( noticeAction );
	} );
} );

describe( 'showErrorNotification', () => {
	it( 'should return a errorNotice action', () => {
		const noticeAction = errorNotice(
			translate( 'Sorry, we had a problem restoring your database password. Please try again.' ),
			{
				duration: 5000,
				id: 'restore-database-password-error',
			}
		);
		expect( showErrorNotification() ).toEqual( noticeAction );
	} );
} );
