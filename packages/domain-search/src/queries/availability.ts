export interface DomainAvailability {
	domain_name: string;
	status: string;
	mappable: string;
	supports_privacy: boolean;
	cost: string;
	sale_cost?: string;
	product_id: number;
	product_slug: string;
	is_price_limit_exceeded?: boolean;
}

const fetchDomainAvailability = async ( domainName: string ): Promise< DomainAvailability > => {
	await new Promise( ( resolve ) => setTimeout( resolve, Math.random() * 3_000 ) );

	if ( domainName === 'example.com' ) {
		return {
			domain_name: 'example.com',
			status: 'available',
			mappable: 'mappable',
			supports_privacy: true,
			cost: '$18.00',
			product_id: 6,
			product_slug: 'domain_reg',
		};
	}

	if ( domainName === 'example.org' ) {
		return {
			domain_name: 'example.org',
			status: 'available',
			mappable: 'mappable',
			supports_privacy: true,
			cost: '$18.00',
			sale_cost: '$10.00',
			product_id: 6,
			product_slug: 'domain_reg',
		};
	}

	if ( domainName === 'example.net' ) {
		return {
			domain_name: 'example.net',
			status: 'available',
			mappable: 'mappable',
			supports_privacy: true,
			cost: '$18.00',
			product_id: 6,
			product_slug: 'domain_reg',
			is_price_limit_exceeded: true,
		};
	}

	throw new Error( `Domain ${ domainName } not found` );
};

export const domainAvailabilityQuery = ( domainName: string ) => ( {
	queryKey: [ 'domain-availability', domainName ],
	queryFn: () => fetchDomainAvailability( domainName ),
} );
