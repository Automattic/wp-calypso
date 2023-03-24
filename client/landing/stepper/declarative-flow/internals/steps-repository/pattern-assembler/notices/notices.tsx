import { SnackbarList, withNotices } from '@wordpress/components';
import i18n from 'i18n-calypso';
import type { Pattern } from '../types';
import './notices.scss';

const Notices = ( {
	noticeList,
	noticeOperations,
}: Pick< withNotices.Props, 'noticeList' | 'noticeOperations' > ) => {
	const onRemoveNotice = ( id: string ) => {
		noticeOperations.removeNotice( id );
	};

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
