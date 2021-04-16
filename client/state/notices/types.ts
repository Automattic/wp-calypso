/**
 * Internal dependencies
 */
import { NoticeStatus, NoticeText } from 'calypso/components/notice/types';

export type NoticeId = string;

export type NoticeCreationActionType = 'NOTICE_CREATE';
export type NoticeRemovalActionType = 'NOTICE_REMOVE';

// Notice options that are always the same
export interface BaseNoticeOptions {
	button?: string;
	displayOnNextPage?: boolean;
	duration?: null | number;
	href?: string;
	isPersistent?: boolean;
	onClick?: () => void;
	showDismiss?: boolean;
}

// Notice options as they're expected by the action creator
export interface NoticeOptions extends BaseNoticeOptions {
	id?: NoticeId;
}

// Notice options as they're returned by the action creator
export interface NoticeActionOptions extends BaseNoticeOptions {
	noticeId: NoticeId;
	status: NoticeStatus;
	text: NoticeText;
}

// Notice action as returned by the action creator
export type NoticeAction = {
	type: NoticeCreationActionType;
	notice: NoticeActionOptions;
};

// Notice creation action creator function
export type NoticeActionCreator = (
	text: NoticeText,
	noticeOptions?: NoticeOptions
) => NoticeAction;

// Higher level notice creation action creator function with status
export type NoticeActionCreatorWithStatus = (
	status: NoticeStatus,
	text: NoticeText,
	noticeOptions?: NoticeOptions
) => NoticeAction;

// Notice removal action creator function
export type NoticeRemovalActionCreator = (
	noticeId: NoticeId
) => {
	noticeId: NoticeId;
	type: NoticeRemovalActionType;
};
