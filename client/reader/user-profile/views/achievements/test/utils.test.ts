import {
	deduplicateAchievementsById,
	deduplicateAchievementsBySlug,
	isFullyEarned,
	isLockedSecret,
	isMaskedSecret,
} from '../utils';
import type {
	Achievement,
	LockedAchievement,
	LockedSecretAchievement,
	MaskedSecretAchievement,
} from '@automattic/api-core';

const fullyEarned: Achievement = {
	achievement_id: 1,
	slug: 'test',
	name: 'Test',
	description: 'desc',
	badge_prefix: 'p',
	level: 1,
	date: '2026-01-01T00:00:00Z',
	image: 'https://example.com/img.png',
	retired: false,
	is_secret: false,
};

const maskedSecret: MaskedSecretAchievement = {
	achievement_id: 2,
	is_secret: true,
	date: '2026-01-02T00:00:00Z',
};

const locked: LockedAchievement = {
	achievement_id: 3,
	slug: 'locked',
	name: 'Locked',
	description: 'd',
	badge_prefix: 'p',
	is_secret: false,
	date_created: '2026-01-03T00:00:00Z',
};

const lockedSecret: LockedSecretAchievement = {
	achievement_id: 4,
	is_secret: true,
	date_created: '2026-01-04T00:00:00Z',
};

describe( 'isFullyEarned', () => {
	test( 'returns true for an Achievement', () => {
		expect( isFullyEarned( fullyEarned ) ).toBe( true );
	} );

	test( 'returns false for a MaskedSecretAchievement', () => {
		expect( isFullyEarned( maskedSecret ) ).toBe( false );
	} );

	test( 'returns true for a legacy Achievement without is_secret set', () => {
		const { is_secret: _omit, ...legacy } = fullyEarned;
		expect( isFullyEarned( legacy as Achievement ) ).toBe( true );
	} );
} );

describe( 'isMaskedSecret', () => {
	test( 'returns true for a MaskedSecretAchievement', () => {
		expect( isMaskedSecret( maskedSecret ) ).toBe( true );
	} );

	test( 'returns false for a fully earned Achievement', () => {
		expect( isMaskedSecret( fullyEarned ) ).toBe( false );
	} );
} );

describe( 'isLockedSecret', () => {
	test( 'returns true for a LockedSecretAchievement', () => {
		expect( isLockedSecret( lockedSecret ) ).toBe( true );
	} );

	test( 'returns false for a non-secret LockedAchievement', () => {
		expect( isLockedSecret( locked ) ).toBe( false );
	} );
} );

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
	test( 'keeps the highest level and oldest date for a leveled slug', () => {
		const a: Achievement = { ...fullyEarned, achievement_id: 10, level: 1, date: '2026-01-01' };
		const b: Achievement = {
			...fullyEarned,
			achievement_id: 11,
			level: 2,
			date: '2026-02-01',
			image: 'https://example.com/level2.png',
		};

		const result = deduplicateAchievementsBySlug( [ a, b ] );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].level ).toBe( 2 );
		expect( result[ 0 ].image ).toBe( 'https://example.com/level2.png' );
		expect( result[ 0 ].date ).toBe( '2026-01-01' );
	} );
} );
