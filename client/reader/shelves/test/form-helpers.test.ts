import { translate } from 'i18n-calypso';
import {
	getShelfErrorMessage,
	validateFeeds,
	validateLanguages,
	validateTags,
} from '../form-helpers';

describe( 'getShelfErrorMessage', () => {
	it.each( [
		[ 'reader_shelves_title_too_long', 'The name must be 50 characters or fewer' ],
		[ 'reader_shelves_too_many_feeds', 'You can add up to 50 feeds.' ],
		[ 'reader_shelves_too_many_tags', 'You can add up to 8 tags.' ],
		[ 'reader_shelves_too_many_languages', 'You can add up to 5 languages.' ],
		[
			'reader_shelves_rate_limited',
			'Too many shelf changes. Please wait a bit before trying again.',
		],
	] )( 'maps %s to user-facing copy', ( code, expected ) => {
		expect( getShelfErrorMessage( { code }, translate ) ).toBe( expected );
	} );

	it( 'reads the code off the legacy xhr `.error` field', () => {
		expect( getShelfErrorMessage( { error: 'reader_shelves_rate_limited' }, translate ) ).toBe(
			'Too many shelf changes. Please wait a bit before trying again.'
		);
	} );

	it( 'falls back to a generic message for unknown codes', () => {
		expect( getShelfErrorMessage( { code: 'something_else' }, translate ) ).toBe(
			'Something went wrong. Please try again.'
		);
	} );
} );

describe( 'validateFeeds', () => {
	it( 'allows up to the limit', () => {
		expect( validateFeeds( 50, translate ) ).toBeNull();
	} );

	it( 'rejects over the limit', () => {
		expect( validateFeeds( 51, translate ) ).toBe( 'You can add up to 50 feeds.' );
	} );
} );

describe( 'validateTags', () => {
	it( 'allows up to the limit', () => {
		expect( validateTags( 8, translate ) ).toBeNull();
	} );

	it( 'rejects over the limit', () => {
		expect( validateTags( 9, translate ) ).toBe( 'You can add up to 8 tags.' );
	} );
} );

describe( 'validateLanguages', () => {
	it( 'allows up to the limit', () => {
		expect( validateLanguages( 5, translate ) ).toBeNull();
	} );

	it( 'rejects over the limit', () => {
		expect( validateLanguages( 6, translate ) ).toBe( 'You can add up to 5 languages.' );
	} );
} );
