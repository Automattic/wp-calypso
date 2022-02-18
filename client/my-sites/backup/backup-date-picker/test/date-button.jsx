const mockUseDispatch = () => () => null;
const mockUseSelector = ( func ) => func();

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn(),
	useSelector: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( '../hooks', () => ( {
	...jest.requireActual( '../hooks' ),
	useCanGoToDate: jest.fn(),
} ) );

import { shallow } from 'enzyme';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import DateButton from '../date-button';

const getTracksEventName = ( event ) => event.meta.analytics[ 0 ].payload.name;

describe( 'Test Backup Date Picker', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		useDispatch.mockImplementation( mockUseDispatch );
		useSelector.mockImplementation( mockUseSelector );
	} );

	test( 'Records a tracks event when the date picker is opened', () =>
		new Promise( ( done ) => {
			const checkTracksEvent = ( event ) => {
				const name = getTracksEventName( event );
				expect( name ).toEqual( 'calypso_jetpack_backup_date_picker_open' );
				done();
			};

			// mock the useDispatch hook that will pick up the tracks event
			useDispatch.mockImplementation( () => checkTracksEvent );

			// shallow render
			const DatePicker = shallow( <DateButton selectedDate={ moment() } /> );
			// simulate a click on the button
			DatePicker.find( '.backup-date-picker__date-button-button' ).simulate( 'click' );
		} ) );
} );
