import {
	DOCUMENT_HEAD_LINK_ADD,
	DOCUMENT_HEAD_META_ADD,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET
} from 'state/action-types';

export function setDocumentHeadTitle( title ) {
	return {
		type: DOCUMENT_HEAD_TITLE_SET,
		title
	};
}

export function addDocumentHeadLink( link ) {
	return {
		type: DOCUMENT_HEAD_LINK_ADD,
		link
	};
}

export function addDocumentHeadMeta( meta ) {
	return {
		type: DOCUMENT_HEAD_META_ADD,
		meta
	};
}

export function setDocumentHeadDescription( description ) {
	let meta = {
		name: 'description',
		content: description
	};

	return {
		type: DOCUMENT_HEAD_META_ADD,
		meta
	};
}

export function setDocumentHeadUnreadCount( count ) {
	return {
		type: DOCUMENT_HEAD_UNREAD_COUNT_SET,
		count
	};
}
