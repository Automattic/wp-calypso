/**
 * @jest-environment jsdom
 */
import { DomainData, PartialDomainData } from '@automattic/data-stores';
import { I18N } from 'i18n-calypso';
import { allSitesViewColumns, applyColumnSort } from '../columns';

const translate = ( ( text: string ) => text ) as I18N[ 'translate' ];
const siteColumns = allSitesViewColumns( translate );

test( 'can sort a simple sort column', () => {
	const domains: PartialDomainData[] = [
		{
			domain: '1.com',
			blog_id: 1,
		} as PartialDomainData,
		{
			domain: '2.com',
			blog_id: 1,
		} as PartialDomainData,
		{
			domain: '3.com',
			blog_id: 1,
		} as PartialDomainData,
	];

	const domainData = {
		1: [
			{ domain: '1.com', owner: 'a' } as DomainData,
			{ domain: '2.com', owner: 'f' } as DomainData,
			{ domain: '3.com', owner: 'c' } as DomainData,
		],
	};

	applyColumnSort( domains, domainData, siteColumns, 'owner', 'asc' );

	expect( domains[ 0 ].domain ).toEqual( '1.com' );
	expect( domains[ 1 ].domain ).toEqual( '3.com' );
	expect( domains[ 2 ].domain ).toEqual( '2.com' );

	applyColumnSort( domains, domainData, siteColumns, 'owner', 'desc' );

	expect( domains[ 0 ].domain ).toEqual( '2.com' );
	expect( domains[ 1 ].domain ).toEqual( '3.com' );
	expect( domains[ 2 ].domain ).toEqual( '1.com' );
} );

test( 'can sort status column', () => {
	// todo
	expect( 1 ).toEqual( 1 );
} );
