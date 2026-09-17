/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import LaunchPermissionModal from '..';

const mockDispatch = jest.fn();
const mockShowSupportGuide = jest.fn();

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( name, properties ) => ( {
		type: 'RECORD_TRACKS_EVENT',
		name,
		properties,
	} ) ),
} ) );

jest.mock( 'calypso/a8c-for-agencies/hooks/use-help-center', () => ( {
	__esModule: true,
	default: () => ( { showSupportGuide: mockShowSupportGuide } ),
} ) );

const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

describe( 'LaunchPermissionModal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'records a Tracks event with the source when shown', () => {
		render( <LaunchPermissionModal source="sites" onClose={ jest.fn() } /> );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_prepare_for_launch_no_permission',
			{ source: 'sites' }
		);
	} );

	it( 'calls onClose when "Got it" is clicked', async () => {
		const onClose = jest.fn();
		render( <LaunchPermissionModal source="licenses" onClose={ onClose } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Got it' } ) );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'opens the support guide from the learn more link', async () => {
		render( <LaunchPermissionModal source="sites" onClose={ jest.fn() } /> );

		await userEvent.click(
			screen.getByRole( 'button', { name: 'Learn more about team member permissions' } )
		);

		expect( mockShowSupportGuide ).toHaveBeenCalledTimes( 1 );
	} );
} );
