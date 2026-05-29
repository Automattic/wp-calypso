import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { getDocumentHeadCappedUnreadCount } from 'calypso/state/document-head/selectors/get-document-head-capped-unread-count';
import './style.scss';

// Conversations historically counted *new comments* instead of new posts via a
// Redux-backed hack — see git blame on `countNewComments`. That path required
// reading `pendingItem.comments[]` from Redux plus `state.comments`. The
// React Query migration drops it; conversations now count posts like every
// other stream. Follow-up: re-introduce a `countOverride` prop and a
// conversations-specific wrapper that computes the comment count from
// `useStreamPendingPosts` raw data.
function UpdateNotice( { count = 0, onClick } ) {
	const translate = useTranslate();
	const cappedUnreadCount = useSelector( getDocumentHeadCappedUnreadCount );
	const counterClasses = clsx( 'reader-update-notice', { 'is-active': count > 0 } );

	return (
		<button
			className={ counterClasses }
			onClick={ ( event ) => {
				event.preventDefault();
				onClick?.();
			} }
		>
			<DocumentHead unreadCount={ count } />
			<Gridicon icon="arrow-up" size={ 18 } />
			{ translate( '%s new post', '%s new posts', {
				args: [ cappedUnreadCount ],
				count,
				comment: '%s is the number of new posts. For example: "1" or "40+"',
			} ) }
		</button>
	);
}

UpdateNotice.propTypes = {
	count: PropTypes.number,
	onClick: PropTypes.func,
};

export default UpdateNotice;
