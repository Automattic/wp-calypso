import { pickBestSuggestion } from '../pick-best-suggestion';
import type { DomainSuggestion } from '@automattic/api-core';

const suggestion = ( domain_name: string ): DomainSuggestion =>
	( { domain_name, product_slug: 'domain_reg' } ) as DomainSuggestion;

describe( 'pickBestSuggestion', () => {
	test( 'returns undefined for an empty suggestions array', () => {
		expect( pickBestSuggestion( [], 'examplesite' ) ).toBeUndefined();
	} );

	test( 'returns undefined when suggestions is undefined', () => {
		expect( pickBestSuggestion( undefined, 'examplesite' ) ).toBeUndefined();
	} );

	test( 'picks the clean exact match over a higher-ranked mangled respelling', () => {
		const result = pickBestSuggestion(
			[ suggestion( 'ex-ample-site.com' ), suggestion( 'examplesite.net' ) ],
			'examplesite'
		);
		expect( result?.domain_name ).toBe( 'examplesite.net' );
	} );

	test( 'prefers the .com exact match when several exact matches exist', () => {
		const result = pickBestSuggestion(
			[
				suggestion( 'examplesite.net' ),
				suggestion( 'examplesite.com' ),
				suggestion( 'examplesite.org' ),
			],
			'examplesite'
		);
		expect( result?.domain_name ).toBe( 'examplesite.com' );
	} );

	test( 'returns the first exact match when none ends in .com', () => {
		const result = pickBestSuggestion(
			[ suggestion( 'examplesite.net' ), suggestion( 'examplesite.org' ) ],
			'examplesite'
		);
		expect( result?.domain_name ).toBe( 'examplesite.net' );
	} );

	test( 'rejects a lone mangled respelling of a clean query', () => {
		const result = pickBestSuggestion( [ suggestion( 'ex-ample-site.com' ) ], 'examplesite' );
		expect( result ).toBeUndefined();
	} );

	test( 'rejects a hyphenated top result when no exact match exists for a clean query', () => {
		const result = pickBestSuggestion(
			[ suggestion( 'ex-ample-site.com' ), suggestion( 'examplesite-domains.com' ) ],
			'examplesite'
		);
		expect( result ).toBeUndefined();
	} );

	test( 'accepts a clean top result that does not introduce hyphens', () => {
		const result = pickBestSuggestion(
			[ suggestion( 'examplesiteblog.com' ), suggestion( 'otherthing.com' ) ],
			'examplesite'
		);
		expect( result?.domain_name ).toBe( 'examplesiteblog.com' );
	} );

	test( 'accepts an exact match whose SLD matches a hyphenated search term', () => {
		const result = pickBestSuggestion( [ suggestion( 'my-site.com' ) ], 'my-site' );
		expect( result?.domain_name ).toBe( 'my-site.com' );
	} );

	test( 'rejects a respelling that adds hyphens even when the search term has one', () => {
		const result = pickBestSuggestion( [ suggestion( 'm-y-s-i-t-e.com' ) ], 'my-site' );
		expect( result ).toBeUndefined();
	} );
} );
