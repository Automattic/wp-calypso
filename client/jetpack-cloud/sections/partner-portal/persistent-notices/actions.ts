import { v4 as uuid } from 'uuid';
import {
	JETPACK_MANAGE_PERSISTENT_NOTICE_CREATE,
	JETPACK_MANAGE_PERSISTENT_NOTICE_REMOVE,
} from 'calypso/state/action-types';
import type {
	JetpackManagePersistentNoticeNoticeStatus,
	JetpackManagePersistentNoticeActionOptions,
	JetpackManagePersistentNoticeActionCreator,
	JetpackManagePersistentNoticeRemovalActionCreator,
	JetpackManageNoticeCreationActionType,
	JetpackManagePersistentNoticeText,
	JetpackManagePersistentNoticeOptions,
} from './types';

import './init';

export const removeJetpackManagePersistentNotice: JetpackManagePersistentNoticeRemovalActionCreator =
	( noticeId ) => {
		return {
			noticeId,
			type: JETPACK_MANAGE_PERSISTENT_NOTICE_REMOVE,
		};
	};

// Notice action as returned by the action creator
export type JetpackManagePersistentNoticeAction = {
	type: JetpackManageNoticeCreationActionType;
	notice: JetpackManagePersistentNoticeActionOptions;
};

const createJetpackManagePersistentNotice = (
	id: string,
	status: JetpackManagePersistentNoticeNoticeStatus,
	text: JetpackManagePersistentNoticeText,
	{ ...noticeOptions }: JetpackManagePersistentNoticeOptions = {}
): JetpackManagePersistentNoticeAction => {
	return {
		type: JETPACK_MANAGE_PERSISTENT_NOTICE_CREATE,
		notice: {
			...noticeOptions,
			noticeId: id || uuid(),
			status,
			text,
		},
	};
};

export const warningPartnerPortalPersistentNotice: JetpackManagePersistentNoticeActionCreator = (
	id,
	text,
	noticeOptions
) => createJetpackManagePersistentNotice( id, 'is-warning', text, noticeOptions );
