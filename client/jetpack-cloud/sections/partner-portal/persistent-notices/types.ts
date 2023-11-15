export type JetpackManagePersistentNoticeId = string;

export type JetpackManagePersistentNoticeNoticeStatus =
	| 'is-error'
	| 'is-info'
	| 'is-success'
	| 'is-warning'
	| 'is-plain'
	| 'is-transparent-info';

export type JetpackManageNoticeCreationActionType = 'JETPACK_MANAGE_PERSISTENT_NOTICE_CREATE';
export type JetpackManageNoticeRemovalActionType = 'JETPACK_MANAGE_PERSISTENT_NOTICE_REMOVE';

export type JetpackManagePersistentNoticeText = string;

// Notice options that are always the same
export interface BaseJetpackManagePersistentNoticeOptions {
	linkText?: string;
	linkUrl?: string;
}

// Notice options as they're expected by the action creator
export interface JetpackManagePersistentNoticeOptions
	extends BaseJetpackManagePersistentNoticeOptions {
	id?: JetpackManagePersistentNoticeId;
}

// Notice options as they're returned by the action creator
export interface JetpackManagePersistentNoticeActionOptions
	extends BaseJetpackManagePersistentNoticeOptions {
	noticeId: JetpackManagePersistentNoticeId;
	status: JetpackManagePersistentNoticeNoticeStatus;
	text: JetpackManagePersistentNoticeText;
}

// Notice action as returned by the action creator
export type JetpackManagePersistentNoticeAction = {
	type: JetpackManageNoticeCreationActionType;
	notice: JetpackManagePersistentNoticeActionOptions;
};

// Notice creation action creator function
export type JetpackManagePersistentNoticeActionCreator = (
	id: string,
	text: JetpackManagePersistentNoticeText,
	noticeOptions?: JetpackManagePersistentNoticeOptions
) => JetpackManagePersistentNoticeAction;

// Higher level notice creation action creator function with status
export type JetpackManagePersistentNoticeActionCreatorWithStatus = (
	status: JetpackManagePersistentNoticeNoticeStatus,
	text: JetpackManagePersistentNoticeText,
	noticeOptions?: JetpackManagePersistentNoticeOptions
) => JetpackManagePersistentNoticeAction;

// Notice removal action creator function
export type JetpackManagePersistentNoticeRemovalActionCreator = (
	noticeId: JetpackManagePersistentNoticeId
) => {
	noticeId: JetpackManagePersistentNoticeId;
	type: JetpackManageNoticeRemovalActionType;
};
