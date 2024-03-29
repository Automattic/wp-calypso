import isMappedDomainSite from 'calypso/state/selectors/is-mapped-domain-site';

describe( '#isMappedDomainSite()', () => {
	const siteId = 77203074;
	const sites = {
		items: {
			[ siteId ]: {
				ID: siteId,
				URL: 'https://example.wordpress.com',
				options: {
					is_mapped_domain: false,
				},
			},
		},
		domains: {
			items: {
				[ siteId ]: [
					{
						isWPCOMDomain: false,
					},
				],
			},
		},
	};

	test( 'should return null if the site is unknown', () => {
		const result = isMappedDomainSite(
			{
				sites: {
					...sites,
					items: {},
				},
			},
			siteId
		);

		expect( result ).toBeNull();
	} );

	test( 'should return null if no domain is found', () => {
		const result = isMappedDomainSite(
			{
				sites: {
					...sites,
					domains: {
						items: {},
					},
				},
			},
			siteId
		);

		expect( result ).toBeNull();
	} );

	test( 'it should return false if the site does not have the mapped domain option set to true', () => {
		const result = isMappedDomainSite(
			{
				sites: {
					...sites,
					items: {
						[ siteId ]: {
							ID: siteId,
							URL: 'https://example.wordpress.com',
							options: {
								is_mapped_domain: false,
							},
						},
					},
				},
			},
			siteId
		);

		expect( result ).toBe( false );
	} );

	test( 'it should return false if the site has the mapped domain option set to true', () => {
		const result = isMappedDomainSite(
			{
				sites: {
					...sites,
					items: {
						[ siteId ]: {
							ID: siteId,
							URL: 'https://example.wordpress.com',
							options: {
								is_mapped_domain: true,
							},
						},
					},
				},
			},
			siteId
		);

		expect( result ).toBe( true );
	} );
} );
