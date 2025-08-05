/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { StorageWarningBanner } from '../storage-warning-banner';

interface TestOptions {
	storage_used_bytes: number;
	max_storage_bytes: number;
	isDismissed?: boolean | string;
}

const siteId = 123;

// Only mocks site and settings fields that are necessary for the tests.
// Feel free to add more fields as they are needed.
function mockTestEndpoints( options: TestOptions ) {
	const { storage_used_bytes, max_storage_bytes, isDismissed = false } = options;

	const mediaStorage = {
		storage_used_bytes,
		max_storage_bytes,
		max_storage_bytes_from_addons: 0,
	};

	const preferences = {
		[ `hosting-dashboard-overview-storage-notice-dismissed-${ siteId }` ]:
			typeof isDismissed === 'string' ? isDismissed : isDismissed && 'today',
	};

	const scope = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ siteId }/media-storage` )
		.query( true )
		.reply( 200, mediaStorage )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } )
		.post( '/rest/v1.1/me/preferences' )
		.reply( 200, ( _uri, body ) => body );

	return { mediaStorage, scope };
}

function renderTestBanner() {
	// The only site field used by the banner is ID.
	const testSite = { ID: siteId };
	return render( <StorageWarningBanner site={ testSite as any } /> ); // eslint-disable-line @typescript-eslint/no-explicit-any
}

afterEach( () => nock.cleanAll() );

test( 'warning banner when storage is low, and no banner when storage is not low', async () => {
	mockTestEndpoints( {
		storage_used_bytes: 900,
		max_storage_bytes: 1000,
	} );

	const { queryClient } = renderTestBanner();

	await waitFor( () =>
		expect( screen.queryByText( 'Your site is low on storage' ) ).toBeInTheDocument()
	);

	mockTestEndpoints( {
		storage_used_bytes: 100,
		max_storage_bytes: 1000,
	} );

	queryClient.invalidateQueries();

	await waitFor( () =>
		expect( screen.queryByText( /Upgrade to continue storing media/ ) ).not.toBeInTheDocument()
	);
} );

test( 'banner can not be dismissed when storage is exceeded', async () => {
	mockTestEndpoints( {
		storage_used_bytes: 5001,
		max_storage_bytes: 5000,
	} );

	renderTestBanner();

	await waitFor( () =>
		expect( screen.queryByText( 'Your site is out of storage' ) ).toBeInTheDocument()
	);

	expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
} );

test( 'banner can be dismissed when storage is over 80%', async () => {
	const user = userEvent.setup();
	mockTestEndpoints( {
		storage_used_bytes: 850,
		max_storage_bytes: 1000,
		isDismissed: false,
	} );

	renderTestBanner();

	await waitFor( () =>
		expect( screen.queryByText( 'Your site is low on storage' ) ).toBeInTheDocument()
	);

	await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

	await waitFor( () =>
		expect( screen.queryByText( 'Your site is low on storage' ) ).not.toBeInTheDocument()
	);
} );
