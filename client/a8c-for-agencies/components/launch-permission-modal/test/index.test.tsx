/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type MockedFunction, vi } from 'vitest';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import LaunchPermissionModal from '..';

const mockDispatch = vi.fn();
const mockShowSupportGuide = vi.fn();

vi.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

vi.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: vi.fn( ( name, properties ) => ( {
		type: 'RECORD_TRACKS_EVENT',
		name,
		properties,
	} ) ),
} ) );

vi.mock( 'calypso/a8c-for-agencies/hooks/use-help-center', () => ( {
	__esModule: true,
	default: () => ( { showSupportGuide: mockShowSupportGuide } ),
} ) );

const mockedRecordTracksEvent = recordTracksEvent as MockedFunction< typeof recordTracksEvent >;

describe( 'LaunchPermissionModal', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'records a Tracks event with the source when shown', () => {
		render( <LaunchPermissionModal source="sites" onClose={ vi.fn() } /> );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_prepare_for_launch_no_permission',
			{ source: 'sites' }
		);
	} );

	it( 'calls onClose when "Got it" is clicked', async () => {
		const onClose = vi.fn();
		render( <LaunchPermissionModal source="licenses" onClose={ onClose } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Got it' } ) );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'opens the support guide from the learn more link', async () => {
		render( <LaunchPermissionModal source="sites" onClose={ vi.fn() } /> );

		await userEvent.click(
			screen.getByRole( 'button', { name: 'Learn more about team member permissions' } )
		);

		expect( mockShowSupportGuide ).toHaveBeenCalledTimes( 1 );
	} );
} );
