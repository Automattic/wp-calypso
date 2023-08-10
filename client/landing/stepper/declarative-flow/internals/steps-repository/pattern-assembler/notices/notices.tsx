import { Notice, SnackbarList } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import i18n from 'i18n-calypso';
import { ComponentType, ReactNode, ReactElement, useState } from 'react';
import type { Pattern } from '../types';
import './notices.scss';

const NOTICE_TIMEOUT = 5000;

type Notice = Omit< React.ComponentProps< typeof Notice >, 'children' > & {
	timer?: ReturnType< typeof setTimeout >;
	id: string;
	content: string;
};

interface NoticeOperationsProps {
	showPatternInsertedNotice: ( pattern: Pattern ) => void;
	showPatternRemovedNotice: ( pattern: Pattern ) => void;
}

export interface NoticesProps {
	noticeOperations: NoticeOperationsProps;
	noticeUI: ReactNode;
}

const withNotices = createHigherOrderComponent(
	< OuterProps, >( InnerComponent: ComponentType< OuterProps > ) => {
		return ( props: OuterProps & NoticesProps ) => {
			const [ noticeList, setNoticeList ] = useState< Notice[] >( [] );

			const removeNotice = ( id: string ) => {
				setNoticeList( ( current ) => current.filter( ( notice ) => notice.id !== id ) );
			};

			const createNotice = ( id: string, content: ReactElement | string | number ) => {
				const existingNoticeWithSameId = noticeList.find( ( notice ) => notice.id === id );
				if ( existingNoticeWithSameId?.timer ) {
					clearTimeout( existingNoticeWithSameId.timer );
					delete existingNoticeWithSameId.timer;
				}

				const newNotice = {
					id,
					content,
					timer: setTimeout( () => {
						removeNotice( id );
					}, NOTICE_TIMEOUT ),
				};

				setNoticeList(
					( current ) =>
						[ ...current.filter( ( notice ) => notice.id !== id ), newNotice ] as Notice[]
				);
			};

			const noticeOperations: NoticeOperationsProps = {
				showPatternInsertedNotice: ( pattern: Pattern ) => {
					createNotice(
						'pattern-inserted',
						i18n.translate( 'Block pattern "%(patternName)s" inserted.', {
							args: { patternName: pattern.title },
						} )
					);
				},
				showPatternRemovedNotice: ( pattern: Pattern ) => {
					createNotice(
						'pattern-removed',
						i18n.translate( 'Block pattern "%(patternName)s" removed.', {
							args: { patternName: pattern.title },
						} )
					);
				},
			};

			const noticeUI = <SnackbarList notices={ noticeList } onRemove={ removeNotice } />;

			const propsWithNotices = {
				...props,
				noticeOperations,
				noticeUI,
			};

			return <InnerComponent { ...propsWithNotices } />;
		};
	},
	'withNotices'
);

export default withNotices;
