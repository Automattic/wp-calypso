/**
 * Internal Dependencies
 */
import {
	READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE,
	READER_SEEN_UNSEEN_STATUS_ALL_REQUEST,
	READER_SEEN_MARK_AS_SEEN_REQUEST,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_REQUEST,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_REQUEST,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_UNSEEN_REQUEST,
	READER_SEEN_MARK_ALL_AS_UNSEEN_RECEIVE,
} from 'state/reader/action-types';

/**
 * Load data layer dependencies
 */
import 'state/data-layer/wpcom/seen-posts/seen/new/index';
import 'state/data-layer/wpcom/seen-posts/seen/delete/index';
import 'state/data-layer/wpcom/seen-posts/seen/all/new/index';
import 'state/data-layer/wpcom/seen-posts/seen/all/delete/index';
import 'state/data-layer/wpcom/seen-posts/status/unseen/all/index';

export const requestUnseenStatusAll = ( { showSubsections = true } = {} ) => ( {
	type: READER_SEEN_UNSEEN_STATUS_ALL_REQUEST,
	showSubsections,
} );

export const receiveUnseenStatusAll = ( { sections } ) => ( {
	type: READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE,
	sections,
} );

export const requestMarkAsSeen = ( { seenIds, globalIds, source } ) => ( {
	type: READER_SEEN_MARK_AS_SEEN_REQUEST,
	seenIds,
	globalIds,
	source,
} );

export const receiveMarkAsSeen = ( { globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_SEEN_RECEIVE,
	globalIds,
} );

export const requestMarkAsUnseen = ( { seenIds, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_UNSEEN_REQUEST,
	seenIds,
	globalIds,
} );

export const receiveMarkAsUnseen = ( { section, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	section,
	globalIds,
} );

export const requestMarkAllAsSeen = ( { section } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_REQUEST,
	section,
} );

export const receiveMarkAllAsSeen = ( { section, globalIds } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	section,
	globalIds,
} );

export const requestMarkAllAsUnseen = ( { section } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_UNSEEN_REQUEST,
	section,
} );

export const receiveMarkAllAsUnseen = ( { section, globalIds } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_UNSEEN_RECEIVE,
	section,
	globalIds,
} );
