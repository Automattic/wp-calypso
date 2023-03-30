import { SnackbarList, withNotices, NoticeList } from '@wordpress/components';
import i18n from 'i18n-calypso';
import { useEffect } from 'react';
import type { Pattern } from '../types';
import './notices.scss';

const NOTICE_TIMEOUT = 5000;

type Notice = NoticeList.Notice & {
	timer?: ReturnType< typeof setTimeout >;
};

const Notices = ( {
	noticeList,
	noticeOperations,
}: Pick< withNotices.Props, 'noticeList' | 'noticeOperations' > ) => {
	const onRemoveNotice = ( id: string ) => {
		const notice = noticeList.find( ( notice ) => id === notice.id ) as Notice;
		if ( notice?.timer ) {
			clearTimeout( notice.timer );
			delete notice.timer;
		}
		noticeOperations.removeNotice( id );
	};

	useEffect( () => {
		const lastNotice = noticeList[ noticeList.length - 1 ] as Notice;

		if ( lastNotice?.id && ! lastNotice?.timer ) {
			lastNotice.timer = setTimeout(
				() => noticeOperations.removeNotice( lastNotice.id ),
				NOTICE_TIMEOUT
			);
		}
	}, [ noticeList, noticeOperations ] );

	return <SnackbarList notices={ noticeList } onRemove={ onRemoveNotice } />;
};

export const getNoticeContent = ( action: string, pattern: Pattern ) => {
	const actions: { [ key: string ]: any } = {
		add: i18n.translate( 'Block pattern "%(patternName)s" inserted.', {
			args: { patternName: pattern.name },
		} ),
		replace: i18n.translate( 'Block pattern "%(patternName)s" replaced.', {
			args: { patternName: pattern.name },
		} ),
		remove: i18n.translate( 'Block pattern "%(patternName)s" removed.', {
			args: { patternName: pattern.name },
		} ),
	};

	return actions[ action ];
};

export default Notices;
