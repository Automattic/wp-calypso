import {
	BaseNoticeOptions,
	NoticeOptions,
	NoticeText,
	NoticeId,
	NoticeCreationActionType,
} from 'calypso/state/notices/types';

export type JetpackManagePersistentNoticeStatusWarning = 'is-jetpack-manage-persistent-warning';
export type JetpackManagePersistentNoticeNoticeStatus = JetpackManagePersistentNoticeStatusWarning;

// Notice options as they're returned by the action creator
export interface JetpackManagePersistentNoticeActionOptions extends BaseNoticeOptions {
	noticeId: NoticeId;
	status: JetpackManagePersistentNoticeNoticeStatus;
	text: NoticeText;
}

// Notice action as returned by the action creator
export type JetpackManagePersistentNoticeAction = {
	type: NoticeCreationActionType;
	notice: JetpackManagePersistentNoticeActionOptions;
};

// Notice creation action creator function
export type JetpackManagePersistentNoticeActionCreator = (
	text: NoticeText,
	noticeOptions?: NoticeOptions
) => JetpackManagePersistentNoticeAction;

// Higher level notice creation action creator function with status
export type JetpackManagePersistentNoticeActionCreatorWithStatus = (
	status: JetpackManagePersistentNoticeNoticeStatus,
	text: NoticeText,
	noticeOptions?: NoticeOptions
) => JetpackManagePersistentNoticeAction;
