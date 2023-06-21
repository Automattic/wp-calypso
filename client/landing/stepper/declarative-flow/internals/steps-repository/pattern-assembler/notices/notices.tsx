import { SnackbarList, withNotices } from '@wordpress/components';
import i18n from 'i18n-calypso';
import { ReactNode, useEffect, useRef } from 'react';
import type { Pattern } from '../types';
import './notices.scss';

const NOTICE_TIMEOUT = 5000;

const Notices = ( {
	noticeList,
	noticeOperations,
}: Pick< withNotices.Props, 'noticeList' | 'noticeOperations' > ) => {
	const onRemoveNotice = ( id: string ) => {
		noticeOperations.removeNotice( id );
	};

	const timersByContentRef = useRef< Map< ReactNode, ReturnType< typeof setTimeout > > >(
		new Map()
	);
	useEffect( () => {
		timersByContentRef.current.forEach( ( timer, content ) => {
			if ( ! noticeList.some( ( notice ) => notice.content === content ) ) {
				clearTimeout( timer );
				timersByContentRef.current.delete( content );
			}
		} );
		noticeList.forEach( ( notice ) => {
			if ( ! timersByContentRef.current.has( notice.content ) ) {
				timersByContentRef.current.set(
					notice.content,
					setTimeout( () => {
						noticeOperations.removeNotice( notice.id );
					}, NOTICE_TIMEOUT )
				);
			}
		} );
	}, [ noticeList, noticeOperations ] );

	return <SnackbarList notices={ noticeList } onRemove={ onRemoveNotice } />;
};

export const getNoticeContent = ( action: string, pattern: Pattern ) => {
	const actions: { [ key: string ]: any } = {
		add: i18n.translate( 'Block pattern "%(patternName)s" inserted.', {
			args: { patternName: pattern.title },
		} ),
		replace: i18n.translate( 'Block pattern "%(patternName)s" replaced.', {
			args: { patternName: pattern.title },
		} ),
		remove: i18n.translate( 'Block pattern "%(patternName)s" removed.', {
			args: { patternName: pattern.title },
		} ),
	};

	return actions[ action ];
};

export default Notices;
