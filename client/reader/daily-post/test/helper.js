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
	describe( 'isDailyPost', () => {
		it( 'returns false if the post is not from daily post', () => {
			assert.isFalse( helper.isDailyPost( posts.basicPost ) );
		} );

		it( 'returns true if the post is from daily post ', () => {
			assert.isTrue( helper.isDailyPost( posts.dailyPostSitePost ) );
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
