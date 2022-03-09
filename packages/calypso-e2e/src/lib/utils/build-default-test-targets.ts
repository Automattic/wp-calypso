type Env = 'edge' | 'production';

type SiteType = 'Simple' | 'Atomic';

type Record = {
	siteType: SiteType;
	accountName: string;
};

type CustomRecord = {
	[ key: string ]: any;
};

type MergedRecord< T extends CustomRecord > = Record & T;

type ActivationCriteria = { [ key in SiteType ]: boolean };

const availableTargets = {
	edge: [
		{ siteType: 'Simple', accountName: 'gutenbergUpgradeEdgeUser' },
		{ siteType: 'Atomic', accountName: 'gutenbergAtomicSiteEdgeUser' },
	],
	production: [
		{ siteType: 'Simple', accountName: 'gutenbergUpgradeUser' },
		{ siteType: 'Atomic', accountName: 'eCommerceUser' },
	],
};

export function buildDefaultTestTargetsTable< T extends CustomRecord >(
	params: {
		edge?: boolean;
		additionalRecords?: T[];
		activationCriteria?: ActivationCriteria;
	} = {
		edge: false,
	}
) {
	const { edge, additionalRecords, activationCriteria } = params;

	const env = edge ? 'edge' : 'production';

	let records = availableTargets[ env ] as MergedRecord< T >[];

	if ( additionalRecords ) {
		records = records.map( ( target, i ) => ( {
			...target,
			...additionalRecords[ i ],
		} ) );
	}

	if ( activationCriteria ) {
		records = records.filter( ( target ) => activationCriteria[ target.siteType ] );
	}

	return records;
}
