import { useSelector, useDispatch } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { removeNotice } from 'calypso/state/notices/actions';
import { getNotices } from 'calypso/state/notices/selectors';
import GlobalNoticesContainer from './container';

export default function GlobalNotices( { id = 'overlay-notices' } ) {
	const dispatch = useDispatch();
	const removeReduxNotice = ( noticeId, onDismissClick ) => ( e ) => {
		if ( onDismissClick ) {
			onDismissClick( e );
		}
		dispatch( removeNotice( noticeId ) );
	};

	const storeNotices = useSelector( getNotices );
	if ( ! storeNotices.length ) {
		return null;
	}

	const noticesList = storeNotices.map(
		// We'll rest/spread props to notice so arbitrary props can be passed to `Notice`.
		// Be sure to destructure any props that aren't for at `Notice`, e.g. `button`.
		( { button, href, noticeId, onClick, onDismissClick, ...notice } ) => (
			<Notice
				{ ...notice }
				key={ noticeId }
				onDismissClick={ removeReduxNotice( noticeId, onDismissClick ) }
				theme="dark"
			>
				{ button && (
					<NoticeAction href={ href } onClick={ onClick }>
						{ button }
					</NoticeAction>
				) }
			</Notice>
		)
	);

	return <GlobalNoticesContainer id={ id }>{ noticesList }</GlobalNoticesContainer>;
}
