import moment from 'moment';
import { phpToMomentDatetimeFormat } from '../utils';

describe( 'phpToMomentDatetimeFormat', () => {
	const testDate = moment();
	test( 'should return the correct Moment date', () => {
		expect( phpToMomentDatetimeFormat( testDate, 'F j, Y' ) ).toEqual(
			testDate.format( 'MMMM D, YYYY' )
		);
		expect( phpToMomentDatetimeFormat( testDate, 'Y-m-d' ) ).toEqual(
			testDate.format( 'YYYY-MM-DD' )
		);
		expect( phpToMomentDatetimeFormat( testDate, 'm/d/Y' ) ).toEqual(
			testDate.format( 'MM/DD/YYYY' )
		);
		expect( phpToMomentDatetimeFormat( testDate, 'd/m/Y' ) ).toEqual(
			testDate.format( 'DD/MM/YYYY' )
		);
	} );

	test( 'should return the correct Moment time', () => {
		expect( phpToMomentDatetimeFormat( testDate, 'g:i a' ) ).toEqual( testDate.format( 'h:mm a' ) );
		expect( phpToMomentDatetimeFormat( testDate, 'g:i A' ) ).toEqual( testDate.format( 'h:mm A' ) );
		expect( phpToMomentDatetimeFormat( testDate, 'H:i' ) ).toEqual( testDate.format( 'HH:mm' ) );
	} );
} );
