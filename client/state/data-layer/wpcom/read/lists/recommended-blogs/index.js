import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import {
	READER_RECOMMENDED_BLOGS_SITE_ADD,
	READER_RECOMMENDED_BLOGS_SITE_REMOVE,
} from 'calypso/state/reader/action-types';

registerHandlers( 'state/data-layer/wpcom/read/lists/recommended-blogs/index.js', {
	[ READER_RECOMMENDED_BLOGS_SITE_ADD ]: [
		dispatchRequest( {
			fetch: ( action ) => {
				return http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/recommended-blogs/sites/new`,
						apiVersion: '1.2',
						body: { site_id: action.blogId },
					},
					action
				);
			},
			onSuccess: () =>
				successNotice( translate( 'Site added to recommended blogs.' ), {
					duration: DEFAULT_NOTICE_DURATION,
				} ),
			onError: () => errorNotice( translate( 'Error adding site to recommended blogs.' ) ),
		} ),
	],
	[ READER_RECOMMENDED_BLOGS_SITE_REMOVE ]: [
		dispatchRequest( {
			fetch: ( action ) => {
				return http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/recommended-blogs/sites/${ action.blogId }/delete`,
						apiVersion: '1.2',
						body: {},
					},
					action
				);
			},
			onSuccess: () =>
				successNotice( translate( 'Site removed from recommended blogs.' ), {
					duration: DEFAULT_NOTICE_DURATION,
				} ),
			onError: () => errorNotice( translate( 'Error removing site from recommended blogs.' ) ),
		} ),
	],
} );
