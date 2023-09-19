/**
 * @jest-environment jsdom
 */
import { I18N } from 'i18n-calypso';
import moment from 'moment';
import { testDomain } from '../../test-utils';
import { transferStatus } from '../../utils/constants';
import { allSitesViewColumns, applyColumnSort } from '../columns';

const translate = ( ( text: string ) => text ) as I18N[ 'translate' ];
const siteColumns = allSitesViewColumns( translate, {
	isPurchasedDomain: () => true,
} );

describe( 'column sorting', () => {
	let dateTimeFormatSpy;

	const OriginalTimeFormat = Intl.DateTimeFormat;

	beforeAll( () => {
		dateTimeFormatSpy = jest.spyOn( global.Intl, 'DateTimeFormat' );
		dateTimeFormatSpy.mockImplementation(
			( locale, options ) => new OriginalTimeFormat( locale, { ...options, timeZone: 'UTC' } )
		);
	} );

	afterAll( () => {
		dateTimeFormatSpy.mockClear();
	} );

	test( 'can sort a simple sort column', () => {
		const blogId = 1;

		const [ ownedAPartial, ownedAFull ] = testDomain( {
			domain: '1.com',
			blog_id: blogId,
			owner: 'a',
		} );

		const [ ownedByFPartial, ownedByFFull ] = testDomain( {
			domain: '2.com',
			blog_id: blogId,
			owner: 'f',
		} );

		const [ ownedByCPartial, ownedByCFull ] = testDomain( {
			domain: '3.com',
			blog_id: blogId,
			owner: 'c',
		} );

		const domains = [ ownedAPartial, ownedByFPartial, ownedByCPartial ];

		const domainData = {
			[ blogId ]: [ ownedAFull, ownedByFFull, ownedByCFull ],
		};

		const ownerAsc = applyColumnSort( domains, domainData, siteColumns, 'owner', 'asc' );

		expect( ownerAsc[ 0 ].domain ).toEqual( '1.com' );
		expect( ownerAsc[ 1 ].domain ).toEqual( '3.com' );
		expect( ownerAsc[ 2 ].domain ).toEqual( '2.com' );

		const ownerDesc = applyColumnSort( domains, domainData, siteColumns, 'owner', 'desc' );

		expect( ownerDesc[ 0 ].domain ).toEqual( '2.com' );
		expect( ownerDesc[ 1 ].domain ).toEqual( '3.com' );
		expect( ownerDesc[ 2 ].domain ).toEqual( '1.com' );
	} );

	test( 'can sort the status column', () => {
		const blogId = 123;

		const [ activePartial, activeFull ] = testDomain( {
			domain: 'active.com',
			blog_id: blogId,
			wpcom_domain: false,
			type: 'registered',
			has_registration: true,
			points_to_wpcom: true,
			transfer_status: transferStatus.COMPLETED,
		} );

		const [ expiringPartial, expiringFull ] = testDomain( {
			domain: 'expiring.com',
			blog_id: blogId,
			wpcom_domain: false,
			type: 'mapping',
			has_registration: true,
			current_user_is_owner: true,
			expired: false,
			expiry: moment().add( 29, 'days' ).toISOString(),
		} );

		const [ errorPartial, errorFull ] = testDomain( {
			domain: 'error.com',
			blog_id: blogId,
			wpcom_domain: false,
			type: 'mapping',
			has_registration: false,
			expired: false,
			registration_date: moment().subtract( 5, 'days' ).toISOString(),
			expiry: moment().add( 60, 'days' ).toISOString(),
			points_to_wpcom: false,
			auto_renewing: false,
		} );

		const domains = [ activePartial, expiringPartial, errorPartial ];

		const domainData = {
			[ blogId ]: [ activeFull, expiringFull, errorFull ],
		};

		const resultAsc = applyColumnSort( domains, domainData, siteColumns, 'status', 'asc' );

		expect( resultAsc[ 0 ].domain ).toEqual( 'active.com' );
		expect( resultAsc[ 1 ].domain ).toEqual( 'expiring.com' );
		expect( resultAsc[ 2 ].domain ).toEqual( 'error.com' );

		const resultDesc = applyColumnSort( domains, domainData, siteColumns, 'status', 'desc' );

		expect( resultDesc[ 0 ].domain ).toEqual( 'error.com' );
		expect( resultDesc[ 1 ].domain ).toEqual( 'expiring.com' );
		expect( resultDesc[ 2 ].domain ).toEqual( 'active.com' );
	} );
} );
