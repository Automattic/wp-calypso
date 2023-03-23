import { SnackbarList, withNotices } from '@wordpress/components';
import i18n from 'i18n-calypso';
import { ReactNode } from 'react';
import type { Pattern } from '../types';
import './notices.scss';

type NoticesProps = {
	noticeList: withNotices.Props[ 'noticeList' ];
	noticeOperations: withNotices.Props[ 'noticeOperations' ];
	noticeUI?: ReactNode;
};

const Notices = ( { noticeList, noticeOperations }: NoticesProps ) => {
	const onRemoveNotice = ( id: string ) => {
		noticeOperations.removeNotice( id );
	};

	return <SnackbarList notices={ noticeList } onRemove={ onRemoveNotice } />;
};

export const getNoticeContent = ( action: string, pattern: Pattern ) => {
	const actions: { [ key: string ]: any } = {
		add: i18n.translate( 'Pattern "%(categoryName)s" added.', {
			comment: 'A pattern is added to the list using the pattern category as name',
			args: { categoryName: pattern.category?.label },
		} ),
		replace: i18n.translate( 'Pattern "%(categoryName)s" replaced.', {
			args: { categoryName: pattern.category?.label },
		} ),
		remove: i18n.translate( 'Pattern "%(categoryName)s" removed.', {
			args: { categoryName: pattern.category?.label },
		} ),
	};

	return actions[ action ];
};

export default Notices;
