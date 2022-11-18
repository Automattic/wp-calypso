import { getNotices, getNotice } from '../selectors';

describe( 'selectors', () => {
	describe( 'getNotices()', () => {
		beforeEach( () => {
			getNotices.memoizedSelector.cache.clear();
		} );

		test( 'should return an array of notices', () => {
			const notices = getNotices( {
				notices: {
					items: {
						1: { noticeId: 1 },
						2: { noticeId: 2 },
						3: { noticeId: 3 },
					},
				},
			} );

			expect( notices ).toEqual( [ { noticeId: 1 }, { noticeId: 2 }, { noticeId: 3 } ] );
		} );
	} );

	describe( 'getNotice()', () => {
		beforeEach( () => {
			getNotice.memoizedSelector.cache.clear();
		} );

		test( 'should return a notice by id', () => {
			const notice = getNotice(
				{
					notices: {
						items: {
							1: { noticeId: 1 },
							2: { noticeId: 2 },
							3: { noticeId: 3 },
						},
					},
				},
				2
			);

			expect( notice ).toEqual( { noticeId: 2 } );
		} );

		test( 'should return undefined if notice does not exist', () => {
			const notice = getNotice(
				{
					notices: {
						items: {
							1: { noticeId: 1 },
							2: { noticeId: 2 },
							3: { noticeId: 3 },
						},
					},
				},
				4
			);

			expect( notice ).toBeUndefined();
		} );
	} );
} );
