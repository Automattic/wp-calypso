import { isAutoEnrolledBeforeRelease } from '../use-auto-enrolled-prerelease';
import type { WordPressPrerelease } from '@automattic/api-core';

const prerelease: WordPressPrerelease = {
	auto_enrolled: true,
	version: '7.2',
	release_date: '2026-12-08',
};

describe( 'isAutoEnrolledBeforeRelease', () => {
	test( 'is true for an auto-enrolled site before release day', () => {
		expect( isAutoEnrolledBeforeRelease( prerelease, Date.UTC( 2026, 11, 7, 23 ) ) ).toBe( true );
	} );

	test( 'is false from release day on', () => {
		expect( isAutoEnrolledBeforeRelease( prerelease, Date.UTC( 2026, 11, 8 ) ) ).toBe( false );
	} );

	test( 'is false for a site its owner put on the beta track', () => {
		expect(
			isAutoEnrolledBeforeRelease(
				{ ...prerelease, auto_enrolled: false },
				Date.UTC( 2026, 10, 1 )
			)
		).toBe( false );
	} );
} );
