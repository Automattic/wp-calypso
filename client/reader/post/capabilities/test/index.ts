import {
	isCommentsOpen,
	isLoginRequiredToComment,
	isSharable,
	isRebloggable,
	isLikeable,
	isConversationFollowable,
} from '../index';

describe( 'reader/post/capabilities', () => {
	describe( 'isCommentsOpen', () => {
		it( 'returns true when comments_open is true', () => {
			expect( isCommentsOpen( { discussion: { comments_open: true } } ) ).toBe( true );
		} );

		it( 'returns false when comments_open is false', () => {
			expect( isCommentsOpen( { discussion: { comments_open: false } } ) ).toBe( false );
		} );

		it( 'returns false when discussion is undefined', () => {
			expect( isCommentsOpen( {} ) ).toBe( false );
		} );

		it( 'returns false when discussion exists but has no properties', () => {
			expect( isCommentsOpen( { discussion: {} } ) ).toBe( false );
		} );
	} );

	describe( 'isLoginRequiredToComment', () => {
		it( 'returns true when comments_require_registration is true', () => {
			expect(
				isLoginRequiredToComment( {
					discussion: { comments_require_registration: true },
				} )
			).toBe( true );
		} );

		it( 'returns false when comments_require_registration is false', () => {
			expect(
				isLoginRequiredToComment( {
					discussion: { comments_require_registration: false },
				} )
			).toBe( false );
		} );

		it( 'returns false when discussion is undefined', () => {
			expect( isLoginRequiredToComment( {} ) ).toBe( false );
		} );
	} );

	describe( 'isSharable', () => {
		it( 'returns true when site_ID exists and sharing_enabled is true', () => {
			expect( isSharable( { site_ID: 1, sharing_enabled: true } ) ).toBe( true );
		} );

		it( 'returns false when sharing_enabled is false', () => {
			expect( isSharable( { site_ID: 1, sharing_enabled: false } ) ).toBe( false );
		} );

		it( 'returns true when site_ID is missing but sharing_enabled is true', () => {
			expect( isSharable( { sharing_enabled: true } ) ).toBe( true );
		} );

		it( 'returns false when site_is_private is true', () => {
			expect( isSharable( { site_ID: 1, site_is_private: true, sharing_enabled: true } ) ).toBe(
				false
			);
		} );

		it( 'defaults to true when sharing_enabled is undefined', () => {
			expect( isSharable( { site_ID: 1 } ) ).toBe( true );
		} );
	} );

	describe( 'isRebloggable', () => {
		it( 'returns true when site_ID exists, sharing_enabled is true, and user has sites', () => {
			expect( isRebloggable( { site_ID: 1, sharing_enabled: true }, true ) ).toBe( true );
		} );

		it( 'returns false when sharing_enabled is false', () => {
			expect( isRebloggable( { site_ID: 1, sharing_enabled: false }, true ) ).toBe( false );
		} );

		it( 'returns false when user has no sites', () => {
			expect( isRebloggable( { site_ID: 1, sharing_enabled: true }, false ) ).toBe( false );
		} );

		it( 'returns false when site_ID is missing', () => {
			expect( isRebloggable( { sharing_enabled: true }, true ) ).toBe( false );
		} );

		it( 'returns false when post is an external post', () => {
			expect( isRebloggable( { is_external: true }, true ) ).toBe( false );
		} );

		it( 'returns false when site_is_private is true', () => {
			expect(
				isRebloggable( { site_ID: 1, site_is_private: true, sharing_enabled: true }, true )
			).toBe( false );
		} );
	} );

	describe( 'isLikeable', () => {
		it( 'returns true when site_ID exists and likes_enabled is true', () => {
			expect( isLikeable( { site_ID: 1, likes_enabled: true } ) ).toBe( true );
		} );

		it( 'returns false when likes_enabled is false', () => {
			expect( isLikeable( { site_ID: 1, likes_enabled: false } ) ).toBe( false );
		} );

		it( 'returns false when site_ID is missing', () => {
			expect( isLikeable( { likes_enabled: true } ) ).toBe( false );
		} );

		it( 'returns false when post is external', () => {
			expect( isLikeable( { site_ID: 1, is_external: true, likes_enabled: true } ) ).toBe( false );
		} );

		it( 'defaults to true when likes_enabled is undefined', () => {
			expect( isLikeable( { site_ID: 1 } ) ).toBe( true );
		} );
	} );

	describe( 'isConversationFollowable', () => {
		it( 'returns true when site_ID exists, not external, and commentable', () => {
			expect(
				isConversationFollowable( { site_ID: 1, discussion: { comments_open: true } } )
			).toBe( true );
		} );

		it( 'returns false when site_ID is missing', () => {
			expect( isConversationFollowable( { discussion: { comments_open: true } } ) ).toBe( false );
		} );

		it( 'returns false when post is external', () => {
			expect(
				isConversationFollowable( {
					site_ID: 1,
					is_external: true,
					discussion: { comments_open: true },
				} )
			).toBe( false );
		} );

		it( 'returns false when comments are not open', () => {
			expect(
				isConversationFollowable( {
					site_ID: 1,
					discussion: { comments_open: false },
				} )
			).toBe( false );
		} );
	} );
} );
