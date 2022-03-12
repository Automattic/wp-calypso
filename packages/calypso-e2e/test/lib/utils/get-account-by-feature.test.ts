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
		// Objects are rebuilt internall to have their keys sorted. So two objects
		// with the same attributes but in different order will be considered to
		// be the exact same criterion.
		// This also tests that two identical structures can be passed, but the
		// last-defined one will prevail.
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

	it( 'will throw en error if passed feature does not match an account', () => {
		expect( () =>
			getTestAccountByFeature( { gutenberg: 'edge', siteType: 'atomic' } )
		).toThrowError();
	} );

	it( 'will keep the existing feature criteria when more are passed to the function', () => {
		// There's already a default account that would match the criterion below without
		// a variation. We add the variation so that we can select this specific site
		const criteriaForSiteEditor: FeatureCriteria[] = [
			{
				gutenberg: 'edge',
				siteType: 'simple',
				variation: 'siteEditor',
				accountName: 'siteEditorEdgeAccount',
			},
		];
		const siteEditorAccountName = getTestAccountByFeature(
			{
				siteType: 'simple',
				gutenberg: 'edge',
				variation: 'siteEditor',
			},
			criteriaForSiteEditor
		);

		const editorAccountName = getTestAccountByFeature( {
			siteType: 'simple',
			gutenberg: 'edge',
		} );

		expect( siteEditorAccountName ).toBe( 'siteEditorEdgeAccount' );
		expect( editorAccountName ).toBe( 'gutenbergSimpleSiteEdgeUser' );
	} );
} );
