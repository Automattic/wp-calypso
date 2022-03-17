type Env = 'edge' | 'stable';

type SiteType = 'simple' | 'atomic';

type Variant = 'siteEditor';

type Feature = 'gutenberg' | 'coblocks';
type FeatureKey = { [ key in Feature ]?: Env | undefined } & {
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
 * Turns an array of `FeastureCriteria` into a Map that can be easily queried
 * with stringified `FeatureKey`s.
 *
 * @param {FeatureCriteria[]} criteria An array of `FeatureCriteria` objects.
 * @param {FeatureMap} map Instance of `FeatureMap` that will hold the table  queriable by
 * (stringified)`FeatureKey`s objects.
 * @returns {FeatureMap} A `Map`object built from the `criteria` that can be queried by a
 * (stringified) `FeatureKey` object.
 */
function criteriaToMap( criteria: FeatureCriteria[], map: FeatureMap ): FeatureMap {
	return criteria.reduce( ( acc, criteria ) => {
		const { accountName, ...rest } = criteria;
		acc.set( stringifyKey( rest ), accountName );
		return acc;
	}, map );
}

// NOTE If this gets too big, move to its own dedicated module
const defaultCriteria: FeatureCriteria[] = [
	{
		gutenberg: 'edge',
		siteType: 'simple',
		accountName: 'gutenbergSimpleSiteEdgeUser',
	},
	{ gutenberg: 'stable', siteType: 'simple', accountName: 'gutenbergSimpleSiteUser' },
	// The CoBlocks account name takes precedence if CoBlocks edge
	// is present. We have two definitions below to effectivelly
	// ignore gutenberg in this case:
	{
		coblocks: 'edge',
		gutenberg: 'stable',
		siteType: 'simple',
		accountName: 'coBlocksSimpleSiteEdgeUser',
	},
	{
		coblocks: 'edge',
		gutenberg: 'edge',
		siteType: 'simple',
		accountName: 'coBlocksSimpleSiteEdgeUser',
	},
	{
		gutenberg: 'stable',
		siteType: 'simple',
		variant: 'siteEditor',
		accountName: 'siteEditorSimpleSiteUser',
	},
	{
		gutenberg: 'edge',
		siteType: 'simple',
		variant: 'siteEditor',
		accountName: 'siteEditorSimpleSiteEdgeUser',
	},
];

/**
 * Return a WPCOM account name that can be passed over to build a `TestAccount`
 * instance for a test. The account name returned will depend on the attributes
 * passed as part of the `feature` param. The table of criteria for each account
 * can be found in the `defaultCriteria` const that lives in the same module where
 * this function is defined.
 *
 * @param {FeatureKey} feature represents a certain feature that has an account
 * associated with in the criteria table. It will be used as a key to get the
 * right account name.
 * @param {FeatureCriteria[]} criteria Can be used to pass a custom table that will be merged into the
 * default table. Useful to do one-off criteria->account overrides for specific
 * tests.
 * @returns {string} the account name that can be used to build a new `TestAccount` instance.
 */
export function getTestAccountByFeature( feature: FeatureKey, criteria?: FeatureCriteria[] ) {
	let accountsTable = criteriaToMap( defaultCriteria, new Map() );

	if ( criteria ) {
		accountsTable = criteriaToMap( criteria, accountsTable );
	}

	const accountName = accountsTable.get( stringifyKey( feature ) );

	if ( ! accountName ) throw Error( 'No account found for this feature' );

	return accountName;
}
