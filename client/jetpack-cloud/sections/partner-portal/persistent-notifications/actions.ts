import { v4 as uuid } from 'uuid';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import type {
	JetpackManagePersistentNoticeNoticeStatus,
	JetpackManagePersistentNoticeActionOptions,
	JetpackManagePersistentNoticeActionCreator,
} from './types';
import type {
	NoticeCreationActionType,
	NoticeOptions,
	NoticeText,
} from 'calypso/state/notices/types';

// Notice action as returned by the action creator
export type JetpackManagePersistentNoticeAction = {
	type: NoticeCreationActionType;
	notice: JetpackManagePersistentNoticeActionOptions;
};

const createJetpackManagePersistentNotice = (
	status: JetpackManagePersistentNoticeNoticeStatus,
	text: NoticeText,
	{ id, ...noticeOptions }: NoticeOptions = {}
): JetpackManagePersistentNoticeAction => {
	return {
		type: NOTICE_CREATE,
		notice: {
			...noticeOptions,
			noticeId: id || uuid(),
			status,
			text,
		},
	};
};

export const warningPartnerPortalPersistentNotice: JetpackManagePersistentNoticeActionCreator = (
	text,
	noticeOptions
) =>
	createJetpackManagePersistentNotice(
		'is-jetpack-manage-persistent-warning',
		text,
		noticeOptions
	);
