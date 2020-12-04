/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPostRevisionsDiffView } from 'calypso/state/posts/selectors/get-post-revisions-diff-view';

describe( 'getPostRevisionsDiffView', () => {
	test( 'should return "unified" if the revisions UI diffView state is not set', () => {
		expect(
			getPostRevisionsDiffView( {
				posts: {
					revisions: {
						ui: {
							isDialogVisible: true,
						},
					},
				},
			} )
		).to.eql( 'unified' );
	} );

	test( 'should return "split" if the revisions UI diffView state is split', () => {
		expect(
			getPostRevisionsDiffView( {
				posts: {
					revisions: {
						ui: {
							isDialogVisible: true,
							diffView: 'split',
						},
					},
				},
			} )
		).to.eql( 'split' );
	} );
} );
