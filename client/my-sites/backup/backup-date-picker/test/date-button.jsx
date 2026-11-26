/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { vi } from 'vitest';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import DateButton from '../date-button';

const mockDispatch = vi.fn();

vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual( 'react-redux' ) ),
	useDispatch: () => mockDispatch,
	useSelector: vi.fn(),
} ) );
vi.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
vi.mock( 'calypso/state/selectors/get-site-gmt-offset' );
vi.mock( 'calypso/state/selectors/get-site-timezone-value' );

describe( 'Test Backup Date Picker', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );
	test( 'Records a tracks event when the date picker is opened', async () => {
		render( <DateButton selectedDate={ moment() }></DateButton> );

		await userEvent.click( screen.getByText( 'Select Date' ) );
		expect( mockDispatch ).toHaveBeenCalledWith(
			recordTracksEvent( 'calypso_jetpack_backup_date_picker_open' )
		);
	} );
} );
