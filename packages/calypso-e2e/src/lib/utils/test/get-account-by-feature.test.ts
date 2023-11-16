import { describe, expect, it } from '@jest/globals';
import { TestAccountName } from '../../../secrets';
import { getTestAccountByFeature, envToFeatureKey } from '../get-test-account-by-feature';
import type {
	FeatureCriteria,
	TestAccountEnvVariables,
	FeatureKey,
} from '../get-test-account-by-feature';

describe( 'getTestAccountByFeature', function () {
	const customCriteria: FeatureCriteria[] = [
		{
			gutenberg: 'edge',
			coblocks: 'stable',
			siteType: 'simple',
			accountName: 'multipleFeaturesRightAccountName' as TestAccountName,
		},
		{
			gutenberg: 'edge',
			siteType: 'simple',
			accountName: 'multipleFeaturesUndefinedRightAccountName' as TestAccountName,
		},
		{
			gutenberg: 'stable',
			coblocks: 'stable',
			siteType: 'simple',
			accountName: 'wrongAccountName' as TestAccountName,
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

	it( 'order of attributes in the criteria should not matter', () => {
		// Objects are rebuilt internally so as to have their keys sorted. Two objects
		// with the same attributes but in different order will be considered to
		// be the exact same criterion.
		//
		// This also tests that two identical structures can be passed, but the
		// last-defined one will prevail.
		const criteria: FeatureCriteria[] = [
			{
				siteType: 'simple',
				gutenberg: 'edge',
				accountName: 'wrongAccount' as TestAccountName,
			},
			{
				gutenberg: 'edge',
				siteType: 'simple',
				accountName: 'rightAccount' as TestAccountName,
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
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			getTestAccountByFeature( { coblocks: 'foo', siteType: 'bar' } as any )
		).toThrow();
	} );

	it( 'will keep the existing feature criteria when more are passed to the function', () => {
		// There's already a default account that would match the criterion below without
		// a variation. We add the variation so that we can select this specific site
		const customCriteria: FeatureCriteria[] = [
			{
				gutenberg: 'edge',
				siteType: 'simple',
				variant: 'siteEditor',
				accountName: 'siteEditorEdgeAccount' as TestAccountName,
			},
		];
		const siteEditorAccountName = getTestAccountByFeature(
			{
				siteType: 'simple',
				gutenberg: 'edge',
				variant: 'siteEditor',
			},
			customCriteria
		);

		const editorAccountName = getTestAccountByFeature( {
			siteType: 'simple',
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
				siteType: 'simple',
				accountName: 'aNewAccount' as TestAccountName,
			},
		];

		const editorAccountName = getTestAccountByFeature(
			{
				siteType: 'simple',
				gutenberg: 'edge',
			},
			customCriteria
		);

		expect( editorAccountName ).toBe( 'aNewAccount' );
	} );
} );

describe( 'envToFeatureKey', () => {
	const envVariables: TestAccountEnvVariables = {
		COBLOCKS_EDGE: true,
		GUTENBERG_EDGE: false,
		TEST_ON_ATOMIC: false,
		GUTENBERG_NIGHTLY: false,
		JETPACK_TARGET: 'wpcom-production',
		ATOMIC_VARIATION: 'default',
	};

	it( 'will return a proper `FeatureKey` object', () => {
		expect( envToFeatureKey( envVariables ) ).toEqual( {
			coblocks: 'edge',
			gutenberg: 'stable',
			siteType: 'simple',
		} as FeatureKey );
	} );

	it( 'will return a `FeatureKey` object without coblocks (=== `undefined`) if env.COBLOCKS_EDGE is `false`', () => {
		expect( envToFeatureKey( { ...envVariables, COBLOCKS_EDGE: false } )[ 'coblocks' ] ).toBe(
			undefined
		);
	} );

	it( 'will return a `FeatureKey` object with `coblocks: "edge"` if env.COBLOCKS_EDGE is `true`', () => {
		expect( envToFeatureKey( envVariables ) ).toMatchObject( {
			coblocks: 'edge',
		} );
	} );

	it( 'will return a `FeatureKey` object with `gutenberg: "stable"` if env.GUTENBERG_EDGE is `false`', () => {
		expect( envToFeatureKey( envVariables ) ).toMatchObject( { gutenberg: 'stable' } );
	} );

	it( 'will return a `FeatureKey` object with `gutenberg: "edge"` if env.GUTENBERG_EDGE is `true`', () => {
		expect( envToFeatureKey( { ...envVariables, GUTENBERG_EDGE: true } ) ).toMatchObject( {
			gutenberg: 'edge',
		} );
	} );

	it( 'will return a `FeatureKey` object with `gutenberg: "nightly"` if env.GUTENBERG_EDGE is `true`', () => {
		expect( envToFeatureKey( { ...envVariables, GUTENBERG_NIGHTLY: true } ) ).toMatchObject( {
			gutenberg: 'nightly',
		} );
	} );

	it( 'will return a `FeatureKey` object with `siteType: "simple"` if env.TEST_ON_ATOMIC is `false`', () => {
		expect( envToFeatureKey( envVariables ) ).toMatchObject( {
			siteType: 'simple',
		} );
	} );

	it( 'will return a `FeatureKey` object with `siteType: "atomic"` if env.TEST_ON_ATOMIC is `true`', () => {
		expect( envToFeatureKey( { ...envVariables, TEST_ON_ATOMIC: true } ) ).toMatchObject( {
			siteType: 'atomic',
		} );
	} );

	it( 'will include the value for "jetpackTarget" if it is not "wpcom-production"', () => {
		expect(
			envToFeatureKey( { ...envVariables, JETPACK_TARGET: 'wpcom-deployment' } )
		).toMatchObject( {
			jetpackTarget: 'wpcom-deployment',
		} );
	} );

	it( 'will set atomic to true if "jetpackTarget" is "remote-site"', () => {
		expect( envToFeatureKey( { ...envVariables, JETPACK_TARGET: 'remote-site' } ) ).toMatchObject( {
			jetpackTarget: 'remote-site',
			siteType: 'atomic',
		} );
	} );
} );
