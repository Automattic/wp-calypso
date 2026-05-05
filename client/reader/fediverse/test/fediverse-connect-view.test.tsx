/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FediverseConnectView } from '../fediverse-connect-view';
import type { FediverseSiteCapabilities } from '@automattic/api-core';
import type React from 'react';

// ---------------------------------------------------------------------------
// Shared mock state for api-queries hooks. Tests configure these objects to
// control hook return values before rendering.
// ---------------------------------------------------------------------------

let mockCapabilitiesQuery = {
	isSuccess: false,
	isError: false,
	data: undefined as FediverseSiteCapabilities | undefined,
	error: undefined as unknown,
	refetch: jest.fn(),
};

const mockEnableFeatureMutate = jest.fn();
const mockEnableC2sMutate = jest.fn();
const mockEnableUserActorsMutate = jest.fn();
const mockAuthorizeMutate = jest.fn();

jest.mock( '@automattic/api-queries', () => ( {
	useFediverseSiteCapabilitiesQuery: () => mockCapabilitiesQuery,
	useEnableFediverseFeatureMutation: () => ( { mutate: mockEnableFeatureMutate } ),
	useEnableFediverseC2sMutation: () => ( { mutate: mockEnableC2sMutate } ),
	useEnableFediverseUserActorsMutation: () => ( { mutate: mockEnableUserActorsMutate } ),
	useAuthorizeFediverseConnectionMutation: () => ( { mutate: mockAuthorizeMutate } ),
} ) );

// Mock SiteSelector so we can test the PICK_SITE transition without Redux wiring.
jest.mock( 'calypso/components/site-selector', () => ( {
	__esModule: true,
	default: ( { onSiteSelect }: { onSiteSelect: ( id: number ) => void } ) => (
		<button onClick={ () => onSiteSelect( 123 ) }>Pick site</button>
	),
} ) );

// Mock analytics — recordReaderTracksEvent must return a plain Redux action
// so that useDispatch can dispatch it without erroring.
const mockRecordReaderTracksEvent = jest.fn( () => ( { type: 'TEST_TRACKS_EVENT' } ) );
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

function makeCaps(
	overrides: Partial< FediverseSiteCapabilities > = {}
): FediverseSiteCapabilities {
	return {
		activitypub_active: true,
		c2s_enabled: true,
		actors: {
			user: { enabled: true, can_enable: true },
			blog: { enabled: false, can_enable: true },
		},
		oauth_metadata: null,
		site_host: 'example.wordpress.com',
		site_kind: 'wpcom',
		current_user_can_publish: true,
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe( 'FediverseConnectView', () => {
	let assignMock: jest.Mock;
	let originalLocation: Location;

	beforeEach( () => {
		// Reset all mock state before each test.
		mockCapabilitiesQuery = {
			isSuccess: false,
			isError: false,
			data: undefined,
			error: undefined,
			refetch: jest.fn(),
		};

		mockEnableFeatureMutate.mockReset();
		mockEnableC2sMutate.mockReset();
		mockEnableUserActorsMutate.mockReset();
		mockAuthorizeMutate.mockReset();
		mockRecordReaderTracksEvent.mockClear();

		window.sessionStorage.clear();

		originalLocation = window.location;
		assignMock = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { ...originalLocation, assign: assignMock },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
	} );

	// -------------------------------------------------------------------------
	// 1. Initial render
	// -------------------------------------------------------------------------

	it( 'renders SitePickerStep initially', () => {
		renderWithProvider( <FediverseConnectView /> );
		expect( screen.getByRole( 'heading', { name: /connect a fediverse site/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /pick site/i } ) ).toBeVisible();
	} );

	// -------------------------------------------------------------------------
	// 2. Picking a site transitions to CHECKING_CAPABILITIES
	// -------------------------------------------------------------------------

	it( 'transitions to CHECKING_CAPABILITIES (shows spinner) after picking a site', async () => {
		const user = userEvent.setup();

		// Capabilities not yet resolved — stays in CHECKING_CAPABILITIES.
		mockCapabilitiesQuery.isSuccess = false;
		mockCapabilitiesQuery.isError = false;

		renderWithProvider( <FediverseConnectView /> );

		await user.click( screen.getByRole( 'button', { name: /pick site/i } ) );

		// In CHECKING_CAPABILITIES with no caps, CapabilityChecklist renders a spinner.
		await waitFor( () => expect( screen.getByRole( 'presentation' ) ).toBeVisible() );
	} );

	// -------------------------------------------------------------------------
	// 3. Capabilities resolve (all flags true) → CHECKLIST_READY → authorize
	// -------------------------------------------------------------------------

	it( 'shows checklist and triggers authorize flow when all capabilities are green', async () => {
		const user = userEvent.setup();
		const caps = makeCaps();

		// Pre-configure: capabilities succeed immediately on first render.
		mockCapabilitiesQuery.isSuccess = true;
		mockCapabilitiesQuery.data = caps;

		// authorize.mutate resolves synchronously with a URL.
		mockAuthorizeMutate.mockImplementation(
			(
				_params: unknown,
				{ onSuccess }: { onSuccess: ( data: { authorize_url: string; state: string } ) => void }
			) => {
				onSuccess( {
					authorize_url: 'https://example.wordpress.com/oauth/authorize?state=xyz',
					state: 'xyz',
				} );
			}
		);

		renderWithProvider( <FediverseConnectView /> );

		// Pick a site — enters CHECKING_CAPABILITIES then immediately CHECKLIST_READY
		// because capabilities are already resolved.
		await user.click( screen.getByRole( 'button', { name: /pick site/i } ) );

		// Wait for the checklist to appear (CHECKLIST_READY).
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeVisible()
		);

		// Click "Enable & Connect" — all caps are true so goes to AUTHORIZING.
		await user.click( screen.getByRole( 'button', { name: /enable & connect/i } ) );

		// authorize.mutate fires, onSuccess saves state + sets REDIRECTING which assigns URL.
		await waitFor( () =>
			expect( assignMock ).toHaveBeenCalledWith(
				'https://example.wordpress.com/oauth/authorize?state=xyz'
			)
		);

		// OAuth state should be persisted to sessionStorage.
		const stored = JSON.parse(
			window.sessionStorage.getItem( 'reader-fediverse-oauth-state' ) ?? 'null'
		);
		expect( stored ).toMatchObject( { state: 'xyz', blog_id: 123 } );
	} );

	// -------------------------------------------------------------------------
	// 4. activitypub_active: false → clicking "Enable & Connect" calls enableFeature
	// -------------------------------------------------------------------------

	it( 'calls enableFeature.mutate when activitypub_active is false', async () => {
		const user = userEvent.setup();
		const caps = makeCaps( { activitypub_active: false } );

		// Pre-configure: capabilities resolve immediately.
		mockCapabilitiesQuery.isSuccess = true;
		mockCapabilitiesQuery.data = caps;

		// enableFeature does nothing (leaves wizard in ENABLING_FEATURE).
		mockEnableFeatureMutate.mockImplementation( () => undefined );

		renderWithProvider( <FediverseConnectView /> );

		await user.click( screen.getByRole( 'button', { name: /pick site/i } ) );

		// Wait for checklist (activitypub_active=false means the row is unchecked but checklist renders).
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeVisible()
		);

		await user.click( screen.getByRole( 'button', { name: /enable & connect/i } ) );

		await waitFor( () => expect( mockEnableFeatureMutate ).toHaveBeenCalledTimes( 1 ) );
	} );

	// -------------------------------------------------------------------------
	// 5. enableFeature fails with forbidden → permission_denied error state
	// -------------------------------------------------------------------------

	it( 'shows permission-denied error when enableFeature fails with forbidden', async () => {
		const user = userEvent.setup();
		const caps = makeCaps( { activitypub_active: false } );

		mockCapabilitiesQuery.isSuccess = true;
		mockCapabilitiesQuery.data = caps;

		mockEnableFeatureMutate.mockImplementation(
			( _params: unknown, { onError }: { onError: ( err: unknown ) => void } ) => {
				onError( { kind: 'forbidden', message: 'Permission denied.' } );
			}
		);

		renderWithProvider( <FediverseConnectView /> );

		await user.click( screen.getByRole( 'button', { name: /pick site/i } ) );

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /enable & connect/i } ) ).toBeVisible()
		);

		await user.click( screen.getByRole( 'button', { name: /enable & connect/i } ) );

		// The error title uses a curly apostrophe (') from wizard-error-states.tsx.
		await waitFor( () => expect( screen.getByText( /permission to enable this/i ) ).toBeVisible() );
	} );

	// -------------------------------------------------------------------------
	// 6. Capabilities query fails → ERROR with errorStep capability_check
	// -------------------------------------------------------------------------

	it( 'shows capability_check error when capabilities query fails', async () => {
		const user = userEvent.setup();

		// Pre-configure: capabilities fail immediately.
		mockCapabilitiesQuery.isSuccess = false;
		mockCapabilitiesQuery.isError = true;
		mockCapabilitiesQuery.error = { kind: 'upstream_unavailable' };

		renderWithProvider( <FediverseConnectView /> );

		await user.click( screen.getByRole( 'button', { name: /pick site/i } ) );

		// The error title uses a curly apostrophe (') from wizard-error-states.tsx.
		await waitFor( () => expect( screen.getByText( /reach this site/i ) ).toBeVisible() );
	} );
} );
