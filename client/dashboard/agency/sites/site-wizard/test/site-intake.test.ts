import { parseSiteList, sampleSiteList } from '../site-intake';
import { jumpHistory } from '../use-site-wizard';

describe( 'portfolio intake', () => {
	test( 'finds addresses in prose and pasted cells without importing contact emails', () => {
		const result = parseSiteList(
			'Client,Website,Contact\n"Juniper Studio",https://juniper.example,owner@private.example\n' +
				'Please move https://northstar.example/ and fern.example.\n' +
				'contact@another.example\nftp://files.example\nhttps://user:password@private.example'
		);
		expect( result.sites.map( ( site ) => site.id ) ).toEqual( [
			'juniper.example',
			'northstar.example',
			'fern.example',
		] );
		expect( result.sites[ 0 ].name ).toBe( 'Juniper Studio' );
	} );

	test( 'deduplicates protocols, www, admin links, and query strings, but retains subdirectory sites', () => {
		const result = parseSiteList(
			'example.com\nhttp://www.example.com/\nhttps://example.com/wp-admin/?page=dashboard\n' +
				'example.com/?ref=email\nexample.com/client-one\nexample.com/client-two'
		);
		expect( result.duplicates ).toBe( 3 );
		expect( result.sites.map( ( site ) => site.id ) ).toEqual( [
			'example.com',
			'example.com/client-one',
			'example.com/client-two',
		] );
	} );

	test( 'seeds thirty distinct websites and flags a staging site for review', () => {
		const { sites } = parseSiteList( sampleSiteList );
		expect( sites ).toHaveLength( 30 );
		expect( sites.filter( ( site ) => site.staging ) ).toHaveLength( 1 );
		expect(
			parseSiteList( 'No websites here, just client names and contact@example.com' ).sites
		).toEqual( [] );
	} );
} );

test( 'jump history follows the selected branch, including payment and migration method', () => {
	expect( jumpHistory( { journey: 'connect', step: 'connecting' } ) ).toEqual( [
		'start',
		'url',
		'review',
		'authorize',
		'connecting',
	] );
	expect( jumpHistory( { journey: 'migrate', step: 'verify', method: 'self' } ) ).toEqual( [
		'start',
		'source',
		'review',
		'host',
		'method',
		'setup',
		'verify',
	] );
	expect(
		jumpHistory( { journey: 'migrate', step: 'verify', method: 'concierge', billing: 'client' } )
	).toEqual( [
		'start',
		'source',
		'review',
		'host',
		'method',
		'setup',
		'referral-sent',
		'requested',
		'verify',
	] );
	expect( jumpHistory( { journey: 'development', step: 'setup' } ) ).toEqual( [
		'start',
		'new',
		'setup',
	] );
} );
