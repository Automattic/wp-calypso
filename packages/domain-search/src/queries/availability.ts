export interface DomainAvailability {
	domain_name: string;
	status: string;
	mappable: string;
	supports_privacy: boolean;
	cost: string;
	sale_cost?: string;
	renew_cost?: string;
	product_id: number;
	product_slug: string;
	is_price_limit_exceeded?: boolean;
}

const fetchDomainAvailability = async ( domainName: string ): Promise< DomainAvailability > => {
	await new Promise( ( resolve ) => setTimeout( resolve, Math.random() * 1_000 ) );

	if ( domainName === 'example.com' ) {
		return {
			domain_name: 'example.com',
			status: 'available',
			mappable: 'mappable',
			supports_privacy: true,
			cost: '$18',
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
			cost: '$18',
			sale_cost: '$10',
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
			cost: '$18',
			product_id: 6,
			product_slug: 'domain_reg',
			is_price_limit_exceeded: true,
		};
	}

	if ( domainName === 'recommended-example.com' ) {
		return {
			domain_name: 'recommended-example.com',
			status: 'available',
			mappable: 'mappable',
			supports_privacy: true,
			cost: '$18',
			product_id: 6,
			product_slug: 'domain_reg',
		};
	}

	if ( domainName === 'best-alternative-example.org' ) {
		return {
			domain_name: 'best-alternative-example.org',
			status: 'available',
			mappable: 'mappable',
			supports_privacy: true,
			cost: '$18',
			product_id: 6,
			product_slug: 'domain_reg',
		};
	}

	if ( domainName === 'example.app' ) {
		return {
			domain_name: 'example.app',
			status: 'unavailable',
			mappable: 'mappable',
			supports_privacy: true,
			cost: '$18',
			product_id: 6,
			product_slug: 'dotapp_domain',
		};
	}

	if ( domainName === 'example.gay' ) {
		return {
			domain_name: 'example.gay',
			status: 'available',
			mappable: 'mappable',
			supports_privacy: true,
			cost: '$18',
			product_id: 6,
			product_slug: 'dotgay_domain',
		};
	}

	throw new Error( `Domain ${ domainName } not found` );
};

export const domainAvailabilityQuery = ( domainName: string ) => ( {
	queryKey: [ 'domain-availability', domainName ],
	queryFn: () => fetchDomainAvailability( domainName ),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
