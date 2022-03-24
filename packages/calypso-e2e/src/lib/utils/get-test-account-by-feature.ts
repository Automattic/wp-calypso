import defaultCriteria from './criteria-for-test-accounts';
import type { SupportedEnvVariables } from '../../env-variables';

export type TestAccountEnvVariables = Pick<
	SupportedEnvVariables,
	'GUTENBERG_EDGE' | 'COBLOCKS_EDGE' | 'TEST_ON_ATOMIC'
>;

type Env = 'edge' | 'stable' | '*';

export type SiteType = 'simple' | 'atomic' | '*';

type Variant = 'siteEditor' | 'i18n' | '*';

type Feature = 'gutenberg' | 'coblocks';
export type FeatureKey = { [ key in Feature ]?: Env | undefined } & {
	siteType: SiteType;
	variant?: Variant;
};
export type FeatureCriteria = FeatureKey & { accountName: string };
type FeatureMap = Map< string, string >;

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
	}, {} as any ) as FeatureKey;

	return JSON.stringify( sorted );
}

/**
 * Turn an array of `FeatureCriteria` into a Map that can be easily queried
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

		expandIfWildcard( rest ).forEach( ( featureKey ) =>
			featureMap.set( stringifyKey( featureKey ), accountName )
		);

		return featureMap;
	}, map );
}

// Unfortunately, there's no way to derive this data from the types at
// runtime nor a way to generate this from the types at compile-type, so
// we're forced to repeat ourselves here :/
const envs = [ undefined, 'stable', 'edge' ];
const expandableValues = {
	gutenberg: envs,
	coblocks: envs,
	siteType: [ undefined, 'simple', 'atomic' ],
	variant: [ undefined, 'siteEditor', 'i18n' ],
};

const combineObjects = ( [ head, ...[ headTail, ...tailTail ] ] ) => {
	debugger;
	if ( ! headTail ) return head;

	const combined = headTail.reduce( ( acc, x ) => {
		debugger;
		return acc.concat( head.map( ( h ) => ( { ...h, ...x } ) ) );
	}, [] );

	return combineObjects( [ combined, ...tailTail ] );
};
/**
 * Expand wildcards (`*`) in `FeatureKey`s attributes if they're present. If not, just
 * returns the same featureKey wrapped by an array.
 *
 * Example:
 * `{ gutenberg: '*', siteType: '*', variant: 'siteEditor', accountName: 'foobar' }` will be expanded to:
 * - { gutenberg: 'edge', siteType' simple', variant: 'siteEditor', accountName: 'foobar' }
 * - { gutenberg: 'stable', siteType' simple', variant: 'siteEditor', accountName: 'foobar' }
 * - { gutenberg: 'edge', siteType' atomic', variant: 'siteEditor', accountName: 'foobar' }
 * - { gutenberg: 'stable', siteType' atomic', variant: 'siteEditor', accountName: 'foobar' }
 *
 * This makes it trivial to ignore some of the attributes for certain criteria
 * without the need to pollute the table with a lot of new entires (for all
 * possible combinations) manually to do so.
 *
 * @param {FeatureKey} featureKey
 * @returns {Array<FeatureKey>}
 */

export function expandIfWildcard( featureKey: FeatureKey ) {
	const hasWilcards = Object.values( featureKey ).includes( '*' );
	if ( hasWilcards ) {
		const withoutWildcards = ( Object.keys( featureKey ) as Array< keyof FeatureKey > )
			.filter( ( key ) => featureKey[ key ] !== '*' )
			.reduce( ( acc: any, key: keyof FeatureKey ) => {
				const obj = { [ key ]: featureKey[ key ] } as any;
				const arr = Array( 3 ).fill( obj );
				acc.push( arr );
				return acc;
			}, [] );

		debugger;
		let matrix = ( Object.keys( featureKey ) as Array< keyof FeatureKey > ).reduce< FeatureKey[] >(
			( expandable, key: keyof FeatureKey ) => {
				// Unfortunately, there's no way to derive this data from the types at
				// runtime nor a way to generate this from the types at compile-type, so
				// we're forced to repeat ourselves here :/

				if ( featureKey[ key ] === '*' ) {
					const attrs = expandableValues[ key ];

					let sub = [ attrs.map( ( v ) => ( { [ key ]: v } ) ) as any ];

					return expandable.concat( sub );
				}

				return expandable;
			},
			[]
		);
		debugger;

		if ( withoutWildcards ) {
			matrix = matrix.concat( withoutWildcards );
		}

		return combineObjects( matrix );
	}
	return [ featureKey ];
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
 * @returns {string} the account name that can be used to build a new `TestAccount` instance.
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

	if ( ! accountName ) throw Error( 'No account found for this feature' );

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
	return {
		// CoBlocks doesn't have any rule for "stable" as it re-uses the regular
		// Gutenberg stable test site, so we just pass `undefined` if the env
		// var value is `false`. This has the nice-side effect of keeping the
		// `defaultCriteria` table smaller (as we don't need to declare the
		// criteria for CoBlocks stable).
		coblocks: envVariables.COBLOCKS_EDGE ? 'edge' : undefined,
		gutenberg: envVariables.GUTENBERG_EDGE ? 'edge' : 'stable',
		siteType: envVariables.TEST_ON_ATOMIC ? 'atomic' : 'simple',
	};
}
