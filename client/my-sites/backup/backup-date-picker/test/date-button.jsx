jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn(),
} ) );

import { shallow } from 'enzyme';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import DateButton from '../date-button';

const getTracksEventName = ( event ) => event.meta.analytics[ 0 ].payload.name;

describe( 'Test Backup Date Picker', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
