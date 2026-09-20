import { DomainAvailabilityStatus } from '@automattic/api-core';
import { getNamePulseNotice, getResultsLayout, type NamePulseAvailabilityVerdict } from '..';

const TLDS = [ 'blog', 'com', 'net', 'org' ];

const layoutFor = ( query: string ) => getResultsLayout( query, TLDS );

const verdict = (
	status: DomainAvailabilityStatus,
	domain_name = 'icecream.com',
	tld = 'com'
): NamePulseAvailabilityVerdict => ( { status, domain_name, tld } );

describe( 'getNamePulseNotice', () => {
	it( 'stays silent for a plain name and for an available domain', () => {
		expect( getNamePulseNotice( layoutFor( 'icecream' ) ) ).toBeNull();
		expect(
			getNamePulseNotice(
				layoutFor( 'icecream.com' ),
				verdict( DomainAvailabilityStatus.AVAILABLE )
			)
		).toBeNull();
	} );

	it( 'names the unrecognised ending', () => {
		expect( getNamePulseNotice( layoutFor( 'icecream.d' ) ) ).toEqual( {
			status: 'warning',
			dismissible: true,
			message:
				'We don’t recognise that ending. Try .com or .blog, or enter just the name and we’ll suggest the rest.',
		} );
	} );

	it( 'explains that a subdomain was dropped', () => {
		expect( getNamePulseNotice( layoutFor( 'shop.icecream.com' ) ) ).toEqual( {
			status: 'warning',
			dismissible: true,
			message:
				'Domains are registered without a subdomain. Showing results for “icecream.com” instead.',
		} );
	} );

	it( 'explains that a free subdomain is not registrable', () => {
		expect( getNamePulseNotice( layoutFor( 'mysite.wordpress.com' ) ) ).toEqual( {
			status: 'warning',
			dismissible: true,
			message:
				'That’s a free WordPress.com subdomain, not a domain you can register. Showing results for “mysite” instead.',
		} );
	} );

	it( 'offers a transfer for a domain registered elsewhere', () => {
		expect(
			getNamePulseNotice(
				layoutFor( 'icecream.com' ),
				verdict( DomainAvailabilityStatus.TRANSFERRABLE )
			)
		).toEqual( {
			status: 'neutral',
			message: 'This domain is already registered.',
			transferDomain: 'icecream.com',
		} );
	} );

	it( 'offers no transfer for a domain already connected to WordPress.com', () => {
		expect(
			getNamePulseNotice( layoutFor( 'icecream.com' ), verdict( DomainAvailabilityStatus.MAPPED ) )
		).toEqual( {
			status: 'error',
			message: 'This domain is already connected to a WordPress.com site.',
		} );
	} );

	it( 'offers no transfer for a domain registered with WordPress.com', () => {
		expect(
			getNamePulseNotice(
				layoutFor( 'wordpress.com' ),
				verdict( DomainAvailabilityStatus.REGISTERED, 'wordpress.com' )
			)
		).toEqual( {
			status: 'error',
			message: 'This domain is already connected to a WordPress.com site.',
		} );
	} );

	it( 'leaves a plainly unavailable domain to the row that shows it', () => {
		expect(
			getNamePulseNotice(
				layoutFor( 'icecream.com' ),
				verdict( DomainAvailabilityStatus.NOT_AVAILABLE )
			)
		).toBeNull();
	} );

	it( 'offers no transfer for a domain the user already owns', () => {
		expect(
			getNamePulseNotice(
				layoutFor( 'icecream.com' ),
				verdict( DomainAvailabilityStatus.REGISTERED_SAME_SITE )
			)
		).toEqual( {
			status: 'neutral',
			message: 'You already own this domain.',
		} );
	} );

	it( 'leaves a disallowed domain to the row that shows it', () => {
		expect(
			getNamePulseNotice(
				layoutFor( 'mywordpressblog.com' ),
				verdict( DomainAvailabilityStatus.DISALLOWED, 'mywordpressblog.com' )
			)
		).toBeNull();
	} );

	it( 'explains an ending WordPress.com does not sell', () => {
		expect(
			getNamePulseNotice(
				layoutFor( 'icecream.net' ),
				verdict( DomainAvailabilityStatus.TLD_NOT_SUPPORTED, 'icecream.net', 'net' )
			)
		).toEqual( {
			status: 'error',
			message: '.net domains are not available for registration on WordPress.com.',
		} );
	} );

	it( 'prefers the availability verdict over the dropped subdomain', () => {
		expect(
			getNamePulseNotice(
				layoutFor( 'shop.icecream.com' ),
				verdict( DomainAvailabilityStatus.TRANSFERRABLE )
			)
		).toMatchObject( { message: 'This domain is already registered.' } );
	} );
} );
