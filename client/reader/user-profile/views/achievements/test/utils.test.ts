import { deduplicateAchievementsById, deduplicateAchievementsBySlug } from '../utils';
import type { Achievement } from '@automattic/api-core';

const fullyEarned: Achievement = {
	achievement_id: 1,
	slug: 'test',
	name: 'Test',
	description: 'desc',
	badge_prefix: 'p',
	level: 1,
	date_unlocked: '2026-01-01T00:00:00Z',
	date_created: '2025-01-01',
	image: 'https://example.com/img.png',
	is_secret: false,
};

describe( 'deduplicateAchievementsById', () => {
	test( 'keeps the first occurrence of each achievement_id', () => {
		const result = deduplicateAchievementsById( [
			{ achievement_id: 1, name: 'first' },
			{ achievement_id: 2, name: 'second' },
			{ achievement_id: 1, name: 'duplicate' },
		] );

		expect( result ).toEqual( [
			{ achievement_id: 1, name: 'first' },
			{ achievement_id: 2, name: 'second' },
		] );
	} );

	test( 'returns the input unchanged when there are no duplicates', () => {
		const input = [ { achievement_id: 1 }, { achievement_id: 2 }, { achievement_id: 3 } ];
		expect( deduplicateAchievementsById( input ) ).toEqual( input );
	} );
} );

describe( 'deduplicateAchievementsBySlug', () => {
	test( 'keeps the entry with the most recent date_unlocked for a leveled slug', () => {
		const a: Achievement = {
			...fullyEarned,
			achievement_id: 10,
			level: 1,
			date_unlocked: '2026-01-01',
		};
		const b: Achievement = {
			...fullyEarned,
			achievement_id: 11,
			level: 2,
			date_unlocked: '2026-02-01',
			image: 'https://example.com/level2.png',
		};

		const result = deduplicateAchievementsBySlug( [ a, b ] );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].level ).toBe( 2 );
		expect( result[ 0 ].image ).toBe( 'https://example.com/level2.png' );
		expect( result[ 0 ].date_unlocked ).toBe( '2026-02-01' );
	} );
} );
