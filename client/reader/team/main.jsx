/** @format */
/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { findLast, noop, times } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ReaderMain from 'reader/components/reader-main';
import {
	requestPage,
	selectItem,
	selectNextItem,
	selectPrevItem,
	showUpdates,
} from 'state/reader/streams/actions';
import getStream from 'state/selectors/get-reader-stream';
import shouldRequestRecs from 'state/selectors/get-reader-stream-should-request-recommendations';
import getTransformedStreamItems from 'state/selectors/get-reader-stream-transformed-items';

import { shouldShowLikes } from 'reader/like-helper';
import { like as likePost, unlike as unlikePost } from 'state/posts/likes/actions';
import isLikedPost from 'state/selectors/is-liked-post';
import ListEnd from 'components/list-end';
import InfiniteList from 'components/infinite-list';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import UpdateNotice from 'reader/update-notice';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import scrollTo from 'lib/scroll-to';
import XPostHelper from 'reader/xpost-helper';
import { showSelectedPost, getStreamType } from 'reader/utils';
import getBlockedSites from 'state/selectors/get-blocked-sites';
import { keysAreEqual, keyToString, keyForPost } from 'reader/post-key';
import { resetCardExpansions } from 'state/ui/reader/card-expansions/actions';
import { reduxGetState } from 'lib/redux-bridge';
import { getPostByKey } from 'state/reader/posts/selectors';
import { viewStream } from 'state/reader/watermarks/actions';
import { Interval, EVERY_MINUTE } from 'lib/interval';
import { PER_FETCH, INITIAL_FETCH } from 'state/data-layer/wpcom/read/streams';

const TeamStream = props => {
	return <div>sdfasdfds</div>;
};

export default connect(
	( state, { streamKey, recsStreamKey, shouldCombineCards = true } ) => {
		const stream = getStream( state, streamKey );
		console.log( stream );
		return {
			blockedSites: getBlockedSites( state ),
			items: getTransformedStreamItems( state, {
				streamKey,
				recsStreamKey,
				shouldCombine: shouldCombineCards,
			} ),
			stream,
			recsStream: getStream( state, recsStreamKey ),
			selectedPostKey: stream.selected,
			selectedPost: getPostByKey( state, stream.selected ),
			lastPage: stream.lastPage,
			isRequesting: stream.isRequesting,
			shouldRequestRecs: shouldRequestRecs( state, streamKey, recsStreamKey ),
		};
	},
	{
		resetCardExpansions,
		likePost,
		unlikePost,
		requestPage,
		selectItem,
		selectNextItem,
		selectPrevItem,
		showUpdates,
		viewStream,
	}
)( localize( ReaderStream ) );
