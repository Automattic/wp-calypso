import { translate } from 'i18n-calypso';
import { getWindowPresets, getLengthPresets, getVoicePresets } from '../presets';

describe( 'posts-to-podcast presets', () => {
	it( 'returns the three voice presets in order', () => {
		const presets = getVoicePresets( translate );
		expect( presets.map( ( p ) => p.id ) ).toEqual( [ 'witty', 'earnest', 'professional' ] );
		presets.forEach( ( p ) => expect( typeof p.label ).toBe( 'string' ) );
	} );

	it( 'returns the three length presets in order', () => {
		const presets = getLengthPresets( translate );
		expect( presets.map( ( p ) => p.id ) ).toEqual( [ 'short', 'medium', 'long' ] );
	} );

	it( 'returns the four window presets with unit/n shape', () => {
		const presets = getWindowPresets( translate );
		expect( presets.map( ( p ) => p.id ) ).toEqual( [
			'last-7-days',
			'last-14-days',
			'last-30-days',
			'last-3-months',
		] );
		expect( presets[ 0 ] ).toMatchObject( { unit: 'days', n: 7 } );
		expect( presets[ 3 ] ).toMatchObject( { unit: 'months', n: 3 } );
	} );
} );
