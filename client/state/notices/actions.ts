import { NOTICE_CREATE, NOTICE_REMOVE } from 'calypso/state/action-types';
import type {
	NoticeActionCreator,
	NoticeActionCreatorWithStatus,
	NoticeRemovalActionCreator,
} from 'calypso/state/notices/types';

import 'calypso/state/notices/init';

export const removeNotice: NoticeRemovalActionCreator = ( noticeId ) => {
	return {
		noticeId,
		type: NOTICE_REMOVE,
	};
};

export const createNotice: NoticeActionCreatorWithStatus = (
	status,
	text,
	{ id, ...noticeOptions } = {}
) => {
	return {
		type: NOTICE_CREATE,
		notice: Object.assign( { showDismiss: true }, noticeOptions, {
			noticeId: id || crypto.randomUUID(),
			status,
			text,
		} ),
	};
};

export const successNotice: NoticeActionCreator = ( text, noticeOptions ) =>
	createNotice( 'is-success', text, noticeOptions );
export const errorNotice: NoticeActionCreator = ( text, noticeOptions ) =>
	createNotice( 'is-error', text, noticeOptions );
export const infoNotice: NoticeActionCreator = ( text, noticeOptions ) =>
	createNotice( 'is-info', text, noticeOptions );
export const warningNotice: NoticeActionCreator = ( text, noticeOptions ) =>
	createNotice( 'is-warning', text, noticeOptions );
export const plainNotice: NoticeActionCreator = ( text, noticeOptions ) =>
	createNotice( 'is-plain', text, noticeOptions );
