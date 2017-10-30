/** @format */
/**
 * External dependencies
 */
// import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { COMMENTS_BULK_CHANGE_STATUS } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { mergeHandlers } from 'state/action-watchers/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

const changeCommentsStatus = ( { dispatch, getState }, action ) => {
	const { siteId, selectedComments, status } = action;

	dispatch(
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/comments-bulk/`,
				apiVersion: '1.1',
				body: {
					comment_ids: selectedComments,
					status,
				},
			},
			action
		)
	);
};

const foo = () => {};
const bar = () => {};

const bulkHandlers = {
	[ COMMENTS_BULK_CHANGE_STATUS ]: [ dispatchRequest( changeCommentsStatus, foo, bar ) ],
};

export default mergeHandlers( bulkHandlers );
