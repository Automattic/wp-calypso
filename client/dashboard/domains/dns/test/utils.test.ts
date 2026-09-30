/**
 * @jest-environment node
 */
import { getRRsetTtl } from '../utils';
import type { DnsRecord } from '@automattic/api-core';

const domainName = 'example.com';

describe( 'getRRsetTtl', () => {
	const records: DnsRecord[] = [
		{ type: 'MX', name: 'example.com.', data: 'mx-a.example.net.', aux: 10, ttl: 300 },
		{ type: 'MX', name: 'example.com.', data: 'mx-b.example.net.', aux: 10, ttl: 300 },
		{ type: 'A', name: 'www.example.com.', data: '192.0.2.1', ttl: 7200 },
		{
			type: 'SRV',
			name: 'example.com.',
			service: '_sip',
			protocol: '_tcp',
			target: 'sip.example.net.',
			ttl: 600,
		},
	];

	it( 'returns the TTL of the records with the same name and type', () => {
		expect( getRRsetTtl( records, { type: 'MX', name: 'example.com.' }, domainName ) ).toBe( 300 );
	} );

	it( 'matches subdomain names with or without the domain, ignoring case', () => {
		expect( getRRsetTtl( records, { type: 'A', name: 'www' }, domainName ) ).toBe( 7200 );
		expect( getRRsetTtl( records, { type: 'A', name: 'WWW.example.com' }, domainName ) ).toBe(
			7200
		);
	} );

	it( 'returns undefined when no record has the same name and type', () => {
		expect( getRRsetTtl( records, { type: 'TXT', name: 'example.com.' }, domainName ) ).toBe(
			undefined
		);
		expect( getRRsetTtl( records, { type: 'MX', name: 'mail' }, domainName ) ).toBe( undefined );
	} );

	it( 'matches SRV records by service and protocol too', () => {
		expect(
			getRRsetTtl(
				records,
				{ type: 'SRV', name: 'example.com.', service: 'sip', protocol: '_tcp' },
				domainName
			)
		).toBe( 600 );
		expect(
			getRRsetTtl(
				records,
				{ type: 'SRV', name: 'example.com.', service: 'xmpp', protocol: '_tcp' },
				domainName
			)
		).toBe( undefined );
	} );
} );
