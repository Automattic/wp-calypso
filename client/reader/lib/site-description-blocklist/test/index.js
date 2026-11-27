import { isSiteDescriptionBlocked } from '../';

describe( 'isSiteDescriptionBlocked', () => {
	test( 'should return true if a site description is blocked', () => {
		const blockedDescription = 'Just another WordPress site';
		expect( isSiteDescriptionBlocked( blockedDescription ) ).toBe( true );
	} );

	test( 'should return false if a site description is not blocked', () => {
		const unblockedDescription = 'My site is marvellous';
		expect( isSiteDescriptionBlocked( unblockedDescription ) ).toBe( false );
	} );
} );
