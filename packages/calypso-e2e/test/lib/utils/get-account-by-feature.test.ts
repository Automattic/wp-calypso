import { describe, expect, it, test } from '@jest/globals';
import { getTestAccountByFeature } from '../../../src/lib/utils/get-test-account-by-feature';
import type { FeatureCriteria } from '../../../src/lib/utils/get-test-account-by-feature';

describe( 'getTestAccountByFeature', function () {
	const customCriteria: FeatureCriteria[] = [
		{
			gutenberg: 'edge',
			coblocks: 'stable',
			siteType: 'simple',
			accountName: 'multipleFeaturesRightAccountName',
		},
		{
			gutenberg: 'edge',
			siteType: 'simple',
			accountName: 'multipleFeaturesUndefinedRightAccountName',
		},
		{
			gutenberg: 'stable',
			coblocks: 'stable',
			siteType: 'simple',
			accountName: 'wrongAccountName',
		},
	];

	it( 'returns the right default account for single feature', () => {
		const accountName = getTestAccountByFeature( { gutenberg: 'edge', siteType: 'simple' } );

		expect( accountName ).toBe( 'gutenbergSimpleSiteEdgeUser' );
	} );

	it( 'returns the right account for multiple features', () => {
		const accountName = getTestAccountByFeature(
			{
				gutenberg: 'edge',
				coblocks: 'stable',
				siteType: 'simple',
			},
			customCriteria
		);

		expect( accountName ).toBe( 'multipleFeaturesRightAccountName' );
	} );

	it( 'returns the right feature if one of the features is undefined', () => {
		// This simulates a scenario where the presence of a feature depends
		// on external data (i.e env var) and that data might be not set.
		const accountName = getTestAccountByFeature(
			{
				gutenberg: 'edge',
				coblocks: undefined,
				siteType: 'simple',
			},
			customCriteria
		);

		expect( accountName ).toBe( 'multipleFeaturesUndefinedRightAccountName' );
	} );

	test( 'order of attributes in the criteria should not matter', () => {
		// The object is sorted so that even if the same criteria is added
		// but with the keys in different order, it will effectivelly
		// refer to the same feature. The object defined in the criteria
		// (minus the `accountName` k,v pair) is used as a key in the internal
		// map of features -> accounts. Since we sort the keys in the object
		// if there are multiple objects that have the same combination of
		// attributes, the last-defined one will prevail (as it will be replaced
		// in the internal Map).
		const criteria: FeatureCriteria[] = [
			{
				siteType: 'simple',
				gutenberg: 'edge',
				accountName: 'wrongAccount',
			},
			{
				gutenberg: 'edge',
				siteType: 'simple',
				accountName: 'rightAccount',
			},
		];

		const accountName = getTestAccountByFeature(
			{
				siteType: 'simple',
				gutenberg: 'edge',
			},
			criteria
		);

		expect( accountName ).toBe( 'rightAccount' );
	} );
} );
