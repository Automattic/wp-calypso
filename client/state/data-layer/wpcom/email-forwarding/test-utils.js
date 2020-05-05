export const isSuccessNotice = ( action ) => {
	return action && action.notice && 'is-success' === action.notice.status;
};

export const isErrorNotice = ( action ) => {
	return action && action.notice && 'is-error' === action.notice.status;
};

export const noticeHasText = ( action, text ) => {
	return action && action.notice && text === action.notice.text;
};
