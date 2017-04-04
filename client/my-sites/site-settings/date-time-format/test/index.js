/**
 * External dependencies
 */
import chai from 'chai';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { phpToMomentDatetimeFormat } from '../utils';

describe( 'phpToMomentDatetimeFormat', () => {
	const testDate = moment();
	it( 'should return the correct Moment date', function() {
		chai.assert.equal( phpToMomentDatetimeFormat( testDate, 'F j, Y' ), testDate.format( 'MMMM D, YYYY' ) );
		chai.assert.equal( phpToMomentDatetimeFormat( testDate, 'Y-m-d' ), testDate.format( 'YYYY-MM-DD' ) );
		chai.assert.equal( phpToMomentDatetimeFormat( testDate, 'm/d/Y' ), testDate.format( 'MM/DD/YYYY' ) );
		chai.assert.equal( phpToMomentDatetimeFormat( testDate, 'd/m/Y' ), testDate.format( 'DD/MM/YYYY' ) );
	} );

	it( 'should return the correct Moment time', function() {
		chai.assert.equal( phpToMomentDatetimeFormat( testDate, 'g:i a' ), testDate.format( 'h:mm a' ) );
		chai.assert.equal( phpToMomentDatetimeFormat( testDate, 'g:i A' ), testDate.format( 'h:mm A' ) );
		chai.assert.equal( phpToMomentDatetimeFormat( testDate, 'H:i' ), testDate.format( 'HH:mm' ) );
	} );
} );
