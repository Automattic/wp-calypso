/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import * as helper from '../helper';
import * as posts from './fixtures';

describe( 'daily post helper', () => {
	describe( 'isDailyPostChallengeOrPrompt', () => {
		test( 'returns false if the post is not from daily post', () => {
			assert.isFalse( helper.isDailyPostChallengeOrPrompt( posts.basicPost ) );
		} );

		test( 'returns false if the post is from daily post but is not a challenge or prompt', () => {
			assert.isFalse( helper.isDailyPostChallengeOrPrompt( posts.dailyPostSitePost ) );
		} );
	} );

	describe( 'getDailyPostType', () => {
		test( 'returns "prompt" if the post is a daily prompt', () => {
			assert.equal( 'prompt', helper.getDailyPostType( posts.dailyPromptPost ) );
		} );

		test( 'returns "photo" if the post is a photo challenge', () => {
			assert.equal( 'photo', helper.getDailyPostType( posts.photoChallengePost ) );
		} );

		test( 'returns "discover" if the post is a discover challenge', () => {
			assert.equal( 'discover', helper.getDailyPostType( posts.discoverChallengePost ) );
		} );
	} );
} );
