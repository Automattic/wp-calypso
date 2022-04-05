import { describe, expect, it } from '@jest/globals';
import {
	getTestAccountByFeature,
	envToFeatureKey,
} from '../../../src/lib/utils/get-test-account-by-feature';
import type {
	FeatureCriteria,
	TestAccountEnvVariables,
	FeatureKey,
} from '../../../src/lib/utils/get-test-account-by-feature';

describe( 'getTestAccountByFeature', function () {
	const customCriteria: FeatureCriteria[] = [
		{
			gutenberg: 'edge',
			coblocks: 'stable',
			target: 'simple',
			accountName: 'multipleFeaturesRightAccountName',
		},
		{
			gutenberg: 'edge',
			target: 'simple',
			accountName: 'multipleFeaturesUndefinedRightAccountName',
		},
		{
			gutenberg: 'stable',
			coblocks: 'stable',
			target: 'simple',
			accountName: 'wrongAccountName',
		},
	];

	it( 'returns the right default account for single feature', () => {
		const accountName = getTestAccountByFeature( { gutenberg: 'edge', target: 'simple' } );

		expect( accountName ).toBe( 'gutenbergSimpleSiteEdgeUser' );
	} );

	it( 'returns the right account for multiple features', () => {
		const accountName = getTestAccountByFeature(
			{
				gutenberg: 'edge',
				coblocks: 'stable',
				target: 'simple',
			},
			customCriteria
		);

		expect( accountName ).toBe( 'multipleFeaturesRightAccountName' );
	} );

	it( 'returns the right feature if one of the features is undefined', () => {
		// This simulates a scenario where the presence of a feature depends
		// on external data (i.e env var) and that data might be not set. This
		// indicates that that specific feature is not present (or it might just
		// fallback to its default in some sites).
		const accountName = getTestAccountByFeature(
			{
				gutenberg: 'edge',
				coblocks: undefined,
				target: 'simple',
			},
			customCriteria
		);

		expect( accountName ).toBe( 'multipleFeaturesUndefinedRightAccountName' );
	} );

	it( 'order of attributes in the criteria should not matter', () => {
		// Objects are rebuilt internally so as to have their keys sorted. Two objects
		// with the same attributes but in different order will be considered to
		// be the exact same criterion.
		//
		// This also tests that two identical structures can be passed, but the
		// last-defined one will prevail.
		const criteria: FeatureCriteria[] = [
			{
				target: 'simple',
				gutenberg: 'edge',
				accountName: 'wrongAccount',
			},
			{
				gutenberg: 'edge',
				target: 'simple',
				accountName: 'rightAccount',
			},
		];

		const accountName = getTestAccountByFeature(
			{
				target: 'simple',
				gutenberg: 'edge',
			},
			criteria
		);

		expect( accountName ).toBe( 'rightAccount' );
	} );

	it( 'will throw en error if passed feature does not match an account', () => {
		expect( () =>
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			getTestAccountByFeature( { coblocks: 'foo', target: 'bar' } as any )
		).toThrowError();
	} );

	it( 'will keep the existing feature criteria when more are passed to the function', () => {
		// There's already a default account that would match the criterion below without
		// a variation. We add the variation so that we can select this specific site
		const customCriteria: FeatureCriteria[] = [
			{
				gutenberg: 'edge',
				target: 'simple',
				variant: 'siteEditor',
				accountName: 'siteEditorEdgeAccount',
			},
		];
		const siteEditorAccountName = getTestAccountByFeature(
			{
				target: 'simple',
				gutenberg: 'edge',
				variant: 'siteEditor',
			},
			customCriteria
		);

		const editorAccountName = getTestAccountByFeature( {
			target: 'simple',
			gutenberg: 'edge',
		} );

		expect( siteEditorAccountName ).toBe( 'siteEditorEdgeAccount' );
		expect( editorAccountName ).toBe( 'gutenbergSimpleSiteEdgeUser' );
	} );

	it( 'will replace any existing criteria if a identical one is passed as the 2nd argument', () => {
		// There's already a default account that would match the criterion below. The default
		// has an `accoutnName` of `gutenbergSimpleSiteEdgeUser`. By passing this one, the default
		// one should be replaced.
		const customCriteria: FeatureCriteria[] = [
			{
				gutenberg: 'edge',
				target: 'simple',
				accountName: 'aNewAccount',
			},
		];

		const editorAccountName = getTestAccountByFeature(
			{
				target: 'simple',
				gutenberg: 'edge',
			},
			customCriteria
		);

		expect( editorAccountName ).toBe( 'aNewAccount' );
	} );
} );

describe( 'envToFeatureKey', () => {
	const envVariables: TestAccountEnvVariables = {
		COBLOCKS: 'edge',
		GUTENBERG: 'stable',
		TARGET: 'simple',
	};

	it( 'will return a proper `FeatureKey` object based on the `envVariables` object', () => {
		expect( envToFeatureKey( envVariables ) ).toEqual( {
			coblocks: 'edge',
			gutenberg: 'stable',
			target: 'simple',
		} as FeatureKey );
	} );
} );
