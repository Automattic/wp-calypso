/** @format */

export const isSuccessNotice = action => {
	return action && action.notice && 'is-success' === action.notice.status;
};

export const isErrorNotice = action => {
	return action && action.notice && 'is-error' === action.notice.status;
};

export const noticeHasText = ( action, test ) => {
	return action && action.notice && test === action.notice.text;
};
