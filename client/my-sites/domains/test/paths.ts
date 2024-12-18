import { isUnderDomainManagementOverview } from '../paths';

describe( 'path helper functions', () => {
	describe( 'isUnderDomainManagementOverview', () => {
		it.each( [
			[ '/domains/manage/all/overview/emails', true ],
			[ '/domains/manage/all/overview/', true ],
			[ '/domains/manage/all/overview', false ],
			[ '/something-else', false ],
		] )( 'should match overview paths only', ( path, expectedResult ) => {
			expect( isUnderDomainManagementOverview( path ) ).toEqual( expectedResult );
		} );
	} );
} );
