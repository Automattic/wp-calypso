import {
	PAGE_LINK_ADD,
	PAGE_META_ADD,
	PAGE_TITLE_SET,
	PAGE_UNREAD_COUNT_SET
} from 'state/action-types';

export function setTitle( title ) {
	return {
		type: PAGE_TITLE_SET,
		title
	};
}

export function addLink( link ) {
	return {
		type: PAGE_LINK_ADD,
		link
	};
}

export function addMeta( meta ) {
	return {
		type: PAGE_META_ADD,
		meta
	};
}

export function setDescription( description ) {
	let meta = {
		name: 'description',
		content: description
	};

	return {
		type: PAGE_META_ADD,
		meta
	};
}

export function setUnreadCount( count ) {
	return {
		type: PAGE_UNREAD_COUNT_SET,
		count
	};
}
