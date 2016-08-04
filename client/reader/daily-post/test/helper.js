/**
 * External Dependencies
 */
 import { assert } from 'chai';

/**
 * Internal Dependencies
 */

import * as posts from './fixtures';
import * as helper from '../helper';

describe( 'daily post helper', () => {
	describe( 'isDailyPostChallengeOrPrompt', () => {
		it( 'returns false if the post is not from daily post', () => {
			assert.isFalse( helper.isDailyPostChallengeOrPrompt( posts.basicPost ) );
		} );

		it( 'returns false if the post is from daily post but is not a challenge or prompt', () => {
			assert.isFalse( helper.isDailyPostChallengeOrPrompt( posts.dailyPostSitePost ) );
		} );
	} );

	describe( 'getDailyPostType', () => {
		it( 'returns "prompt" if the post is a daily prompt', () => {
			assert.equal( 'prompt', helper.getDailyPostType( posts.dailyPromptPost ) );
		} );

		it( 'returns "photo" if the post is a photo challenge', () => {
			assert.equal( 'photo', helper.getDailyPostType( posts.photoChallengePost ) );
		} );

		it( 'returns "discover" if the post is a discover challenge', () => {
			assert.equal( 'discover', helper.getDailyPostType( posts.discoverChallengePost ) );
		} );
	} );
} );
