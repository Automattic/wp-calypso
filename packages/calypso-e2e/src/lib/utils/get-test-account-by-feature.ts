import defaultCriteria from './criteria-for-test-accounts';
import type { TestAccountName } from '../../secrets';
import type {
	AtomicVariation,
	JetpackTarget,
	SupportedEnvVariables,
} from '../../types/env-variables.types';

export type TestAccountEnvVariables = Pick<
	SupportedEnvVariables,
	| 'GUTENBERG_EDGE'
	| 'GUTENBERG_NIGHTLY'
	| 'COBLOCKS_EDGE'
	| 'TEST_ON_ATOMIC'
	| 'JETPACK_TARGET'
	| 'ATOMIC_VARIATION'
>;

type Env = 'edge' | 'stable' | 'nightly';

export type SiteType = 'simple' | 'atomic';

type Variant = 'siteEditor' | 'i18n';

type Feature = 'gutenberg' | 'coblocks';
export type FeatureKey = { [ key in Feature ]?: Env | undefined } & {
	siteType: SiteType;
	variant?: Variant;
	jetpackTarget?: JetpackTarget;
	atomicVariation?: AtomicVariation;
};
export type FeatureCriteria = FeatureKey & { accountName: TestAccountName };
type FeatureMap = Map< string, TestAccountName >;

/**
 * Sort the keys of the `FeatureKey` structure and finally converts it
 * into a string representation that can be used as a key to a `Map`.
 *
 * @param {FeatureKey} o the FeatureKey object
 * @returns {string} a string representation of the key
 */
function stringifyKey( o: FeatureKey ) {
	const keys = Object.keys( o ) as [ keyof FeatureKey ];
	const sorted = keys.sort().reduce( ( sorted, key ) => {
		sorted[ key ] = o[ key ];
		return sorted;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}, {} as any ) as FeatureKey;

	return JSON.stringify( sorted );
}

/**
 * Turn an array of `FeastureCriteria` into a Map that can be easily queried
 * with stringified `FeatureKey`s.
 *
 * @param {FeatureCriteria[]} criteria An array of `FeatureCriteria` objects.
 * @param {FeatureMap} map Instance of `FeatureMap` that will hold the table  queriable by
 * (stringified)`FeatureKey`s objects.
 * @returns {FeatureMap} A `Map`object built from the `criteria` that can be queried by a
 * (stringified) `FeatureKey` object.
 */
function criteriaToMap( criteria: FeatureCriteria[], map: FeatureMap ): FeatureMap {
	return criteria.reduce( ( featureMap, criteria ) => {
		const { accountName, ...rest } = criteria;
		featureMap.set( stringifyKey( rest ), accountName );
		return featureMap;
	}, map );
}

const defaultAccountsTable = criteriaToMap( defaultCriteria, new Map() );

/**
 * Return a WPCOM account name that can be passed over to build a `TestAccount`
 * instance for an E2E test. The account name returned will depend on the attributes
 * passed as part of the `feature` param. The table of criteria for each account
 * can be found in the `defaultCriteria` const that lives in the same module where
 * this function is defined.
 *
 * @param {FeatureKey} feature represents a certain feature that has an account
 * associated with in the criteria table. It will be used as a key to get the
 * right account name.
 * @param {FeatureCriteria[]} mergeAndOverrideCriteria Can be used to pass a custom table that will
 * be merged into the default one. Useful to do one-off criteria->account overrides for
 * specifis tests inline. The entries passed here will replace any matched (by key) entries
 * in the default table.
 * @returns {TestAccountName} the account name that can be used to build a new `TestAccount` instance.
 */
export function getTestAccountByFeature(
	feature: FeatureKey,
	mergeAndOverrideCriteria?: FeatureCriteria[]
) {
	// If no criteria is passed in the `mergeAndOverrideCriteria` param, then we just fallback
	// to the `defaultAccountsTable`, which should be read-only and never modified (otherwise
	// it could affect the return value of other calls). However, if a `mergeAndOverride`
	// argument is present, then we need to "merge" with the internal table, for that we
	// create an emphemeral table based on the `defaultCriteria`, so that the one in this
	// module is never modified.
	const accountsTable = mergeAndOverrideCriteria
		? criteriaToMap( mergeAndOverrideCriteria, criteriaToMap( defaultCriteria, new Map() ) )
		: defaultAccountsTable;

	const accountName = accountsTable.get( stringifyKey( feature ) );

	if ( ! accountName ) {
		throw Error( 'No account found for this feature' );
	}

	return accountName;
}

/**
 * Ad-hoc helper to convert the env object to a `FeatureKey` object that can
 * then be passed over to `getTestAccountByFeature`. Most data passed to that
 * function will come from env variables, so it makes sense to provide a helper
 * to DRY things up.
 *
 * This helper doesn't attempt to be generic and is very dependant on the current
 * feature "layout" (types and criteria definition). Though it shouldn't happen
 * often, changes to the former might require the logic here to be updated, so
 * beware :)
 *
 * @param {TestAccountEnvVariables} envVariables
 * @returns {FeatureKey}
 */
export function envToFeatureKey( envVariables: TestAccountEnvVariables ): FeatureKey {
	let jetpackTarget: JetpackTarget | undefined;
	if ( ! envVariables.JETPACK_TARGET || envVariables.JETPACK_TARGET === 'wpcom-production' ) {
		// 'wpcom-production' referes to just the default that every other site uses,
		// so we don't need to key off it for users.
		jetpackTarget = undefined;
	} else {
		jetpackTarget = envVariables.JETPACK_TARGET as JetpackTarget;
	}

	let atomicVariation: AtomicVariation | undefined;
	if ( ! envVariables.TEST_ON_ATOMIC || envVariables.ATOMIC_VARIATION === 'default' ) {
		atomicVariation = undefined;
	} else {
		atomicVariation = envVariables.ATOMIC_VARIATION;
	}

	let siteType: SiteType;
	if ( envVariables.JETPACK_TARGET === 'remote-site' ) {
		// All remote sites have similar handling to atomic sites in places like the editor,
		// so we should classify these runs as atomic.
		siteType = 'atomic';
	} else {
		siteType = envVariables.TEST_ON_ATOMIC ? 'atomic' : 'simple';
	}

	let gutenbergVersionType: Env;
	switch ( true ) {
		case envVariables.GUTENBERG_NIGHTLY:
			gutenbergVersionType = 'nightly';
			break;
		case envVariables.GUTENBERG_EDGE:
			gutenbergVersionType = 'edge';
			break;
		default:
			gutenbergVersionType = 'stable';
	}

	return {
		// CoBlocks doesn't have any rule for "stable" as it re-uses the regular
		// Gutenberg stable test site, so we just pass `undefined` if the env
		// var value is `false`. This has the nice-side effect of keeping the
		// `defaultCriteria` table smaller (as we don't need to declare the
		// criteria for CoBlocks stable)
		coblocks: envVariables.COBLOCKS_EDGE ? 'edge' : undefined,
		gutenberg: gutenbergVersionType,
		siteType: siteType,
		jetpackTarget: jetpackTarget,
		atomicVariation: atomicVariation,
	};
}
