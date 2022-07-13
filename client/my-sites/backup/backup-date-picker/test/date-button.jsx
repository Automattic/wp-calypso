/**
 * @jest-environment jsdom
 */

const mockDispatch = jest.fn();

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: () => mockDispatch,
	useSelector: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( '../hooks', () => ( {
	...jest.requireActual( '../hooks' ),
	useCanGoToDate: jest.fn(),
} ) );

import { fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import DateButton from '../date-button';

describe( 'Test Backup Date Picker', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );
	test( 'Records a tracks event when the date picker is opened', () => {
		render( <DateButton selectedDate={ moment() }></DateButton> );

		fireEvent.click( screen.getByText( 'Select Date' ) );
		expect( mockDispatch ).toHaveBeenCalledWith(
			recordTracksEvent( 'calypso_jetpack_backup_date_picker_open' )
		);
	} );
} );
