import { getBucketRanges, chooseVariation } from '../bucket';
import { evalCondition } from '../condition';
import { evalFeature } from '../evaluator';
import { hash } from '../hash';
import casesJson from './cases.json';
import type { Attributes, Feature, Range } from '../types';

type HashCase = { name: string; seed: string; value: string; expected: number };
type BucketRangesCase = {
	name: string;
	num_variations: number;
	coverage?: number;
	weights?: number[] | null;
	expected: Range[];
};
type ChooseVariationCase = {
	name: string;
	n: number;
	variations: Array< { range: Range } >;
	expected: number | null;
};
type ConditionCase = {
	name: string;
	attrs: Record< string, string | null > | unknown[];
	cond: unknown;
	expected: boolean;
};
type FeatureCase = {
	name: string;
	feature: Feature;
	attrs: Record< string, string | null > | unknown[];
	expected: Record< string, unknown >;
};

const cases = casesJson as {
	schema_version: number;
	suites: {
		hash: HashCase[];
		bucket_ranges: BucketRangesCase[];
		choose_variation: ChooseVariationCase[];
		condition: ConditionCase[];
		feature: FeatureCase[];
	};
};

// PHP serializes empty associative arrays as `[]`. Normalize to `{}` so the
// TS field-lookup path behaves consistently.
const toAttributes = ( attrs: Record< string, string | null > | unknown[] ): Attributes =>
	Array.isArray( attrs ) ? {} : ( attrs as Attributes );

describe( 'cross-runtime vectors: hash', () => {
	it.each( cases.suites.hash )( '$name', ( { seed, value, expected } ) => {
		expect( hash( seed, value ) ).toBe( expected );
	} );
} );

describe( 'cross-runtime vectors: bucket_ranges', () => {
	it.each( cases.suites.bucket_ranges )(
		'$name',
		( { num_variations, coverage, weights, expected } ) => {
			expect( getBucketRanges( num_variations, coverage ?? 1.0, weights ?? undefined ) ).toEqual(
				expected
			);
		}
	);
} );

describe( 'cross-runtime vectors: choose_variation', () => {
	it.each( cases.suites.choose_variation )( '$name', ( { n, variations, expected } ) => {
		expect( chooseVariation( n, variations ) ).toBe( expected );
	} );
} );

describe( 'cross-runtime vectors: condition', () => {
	it.each( cases.suites.condition )( '$name', ( { attrs, cond, expected } ) => {
		expect( evalCondition( toAttributes( attrs ), cond ) ).toBe( expected );
	} );
} );

describe( 'cross-runtime vectors: feature', () => {
	it.each( cases.suites.feature )( '$name', ( { feature, attrs, expected } ) => {
		expect( evalFeature( feature, toAttributes( attrs ) ) ).toEqual( expected );
	} );
} );
