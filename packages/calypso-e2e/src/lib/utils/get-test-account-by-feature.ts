type Env = 'edge' | 'stable';

type SiteType = 'simple' | 'atomic';

type Feature = 'gutenberg' | 'coblocks';
type FeatureKey = { [ key in Feature ]?: Env | undefined } & { siteType: SiteType };
export type FeatureCriteria = FeatureKey & { accountName: string };
type FeatureMap = Map< string, string >;

function stringifyKey( o: FeatureKey ) {
	const keys = Object.keys( o ) as [ keyof FeatureKey ];
	const sorted = keys.sort().reduce( ( sorted, key ) => {
		//sorted[ key ] = o[ key ];
		sorted[ key ] = o[ key ];
		return sorted;
	}, {} as any ) as FeatureKey;

	return JSON.stringify( sorted );
}

function criteriaToMap( criteria: FeatureCriteria[], map: FeatureMap ): FeatureMap {
	return criteria.reduce( ( acc, criteria ) => {
		const { accountName, ...rest } = criteria;
		acc.set( stringifyKey( rest ), accountName );
		return acc;
	}, map );
}

// Rename to accountsTable or something along these lines?
const defaultCriteria: FeatureCriteria[] = [
	{
		gutenberg: 'edge',
		siteType: 'simple',
		accountName: 'gutenbergSimpleSiteEdgeUser',
	},
	{ gutenberg: 'stable', siteType: 'simple', accountName: 'gutenbergSimpleSiteUser' },
	// The CoBlocks account name take precedence if CoBlocks edge
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
];

const featuresMap: FeatureMap = new Map();
const defaultFeatures = criteriaToMap( defaultCriteria, featuresMap );

export function getTestAccountByFeature(
	feature: FeatureKey,
	overrideFeatures?: FeatureCriteria[]
) {
	let accountsTable = defaultFeatures;
	if ( overrideFeatures ) {
		accountsTable = criteriaToMap( overrideFeatures, featuresMap );
	}

	debugger;
	const accountName = accountsTable.get( stringifyKey( feature ) );

	if ( ! accountName ) throw Error( 'No account found for this feature' );

	return accountName;
}
