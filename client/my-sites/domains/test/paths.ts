import {
	domainManagementAllEditContactInfo,
	domainManagementAllOverview,
	isUnderDomainManagementOverview,
} from '../paths';

describe( 'isUnderDomainManagementOverview', () => {
	it.each( [
		[ '/domains/manage/all/overview/emails', true ],
		[ '/domains/manage/all/overview/', true ],
		[ '/domains/manage/all/overview', false ],
		[ '/something-else', false ],
	] )( 'should match overview paths only', ( path, expected ) => {
		expect( isUnderDomainManagementOverview( path ) ).toEqual( expected );
	} );
} );

describe( 'domainManagementAllOverview', () => {
	it( 'should return the expected path', () => {
		expect( domainManagementAllOverview( 'site.com', 'domain.com' ) ).toEqual(
			'/domains/manage/all/overview/domain.com/site.com'
		);
	} );
} );

describe( 'domainManagementAllEditContactInfo', () => {
	it( 'should return the expected path', () => {
		expect( domainManagementAllEditContactInfo( 'site.com', 'domain.com' ) ).toEqual(
			'/domains/manage/all/contact-info/edit/domain.com/site.com'
		);
	} );
} );
