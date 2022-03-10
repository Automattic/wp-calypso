type Env = 'edge' | 'production';

type SiteType = 'simple' | 'atomic';

type DeepPartial< T > = T extends object
	? {
			[ P in keyof T ]?: DeepPartial< T[ P ] >;
	  }
	: T;

type Plugin = 'gutenberg' | 'coblocks';

type Accounts = { [ key in SiteType ]: { [ key in Env ]: string } };
type AccountsIndex = { [ key in Plugin ]: Accounts };

type OverridenAccounts = DeepPartial< Accounts >;

type Options = {
	isEdge?: boolean;
	isAtomic?: boolean;
	overridenAccounts?: OverridenAccounts;
};

const defaultGutenbergAccounts: Accounts = {
	simple: { edge: 'gutenbergSimpleSiteEdgeUser', production: 'gutenbergSimpleSiteUser' },
	atomic: { edge: 'gutenbergAtomicSiteEdgeUser', production: 'eCommerceUser' },
};

const defaultCoblocksAccounts: Accounts = {
	simple: { edge: 'coBlocksSimpleSiteEdgeUser', production: 'gutenbergSimpleSiteUser' },
	// not being used, we don't yet test coblocks edge on AT atm
	atomic: { edge: 'gutenbergAtomicSiteEdgeUser', production: 'eCommerceUser' },
};

const accountsIndex: AccountsIndex = {
	gutenberg: defaultGutenbergAccounts,
	coblocks: defaultCoblocksAccounts,
};

function getTestSite(
	forPlugin: Plugin,
	options: Options = {
		isEdge: false,
		isAtomic: false,
	}
) {
	const { isEdge, isAtomic, overridenAccounts } = options;

	let accounts = accountsIndex[ forPlugin ];

	const env = isEdge ? 'edge' : 'production';
	const target = isAtomic ? 'atomic' : 'simple';

	if ( overridenAccounts ) {
		for ( let key in accounts ) {
			const target: SiteType = key as SiteType;
			accounts[ target ] = { ...accounts[ target ], ...overridenAccounts[ target ] };
		}
	}

	return accounts[ target ][ env ];
}

export function getTestAccountForGutenberg( options: Options ) {
	return getTestSite( 'gutenberg', options );
}

export function getTestAccountForCoblocks( options: Options ) {
	return getTestSite( 'coblocks', options );
}
