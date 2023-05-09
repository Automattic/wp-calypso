import * as helper from '../helper';
import * as posts from './fixtures';

describe( 'daily post helper', () => {
	describe( 'isDailyPostChallengeOrPrompt', () => {
		test( 'returns false if the post is not from daily post', () => {
			expect( helper.isDailyPostChallengeOrPrompt( posts.basicPost ) ).toBe( false );
		} );

		test( 'returns false if the post is from daily post but is not a challenge or prompt', () => {
			expect( helper.isDailyPostChallengeOrPrompt( posts.dailyPostSitePost ) ).toBe( false );
		} );
	} );

	describe( 'getDailyPostType', () => {
		test( 'returns "prompt" if the post is a daily prompt', () => {
			expect( 'prompt' ).toEqual( helper.getDailyPostType( posts.dailyPromptPost ) );
		} );

		test( 'returns "photo" if the post is a photo challenge', () => {
			expect( 'photo' ).toEqual( helper.getDailyPostType( posts.photoChallengePost ) );
		} );

		test( 'returns "discover" if the post is a discover challenge', () => {
			expect( 'discover' ).toEqual( helper.getDailyPostType( posts.discoverChallengePost ) );
		} );
	} );
} );
