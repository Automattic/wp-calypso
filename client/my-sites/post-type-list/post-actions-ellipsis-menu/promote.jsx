import { useDispatch } from '@wordpress/data';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import {
	recordDSPEntryPoint,
	usePromoteWidget,
	PromoteWidgetStatus,
} from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getPost } from 'calypso/state/posts/selectors';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function PostActionsEllipsisMenuPromote( {
	globalId,
	postId,
	bumpStatKey,
	status,
	password,
	type,
	siteId,
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isSitePrivate =
		useSelector( ( state ) => siteId && isPrivateSite( state, siteId ) ) || false;
	const keyValue = globalId;
	const { openModal } = useRouteModal( 'blazepress-widget', keyValue );

	const widgetEnabled = usePromoteWidget() === PromoteWidgetStatus.ENABLED;

	if ( isSitePrivate ) {
		return null;
	}

	if ( password !== '' ) {
		return null;
	}

	if ( ! widgetEnabled ) {
		return null;
	}

	if ( ! postId ) {
		return null;
	}

	if ( status !== 'publish' ) {
		return null;
	}

	const showDSPWidget = () => {
		dispatch( recordDSPEntryPoint( bumpStatKey ) );
		openModal();
	};

	return (
		<PopoverMenuItem onClick={ showDSPWidget } icon={ 'speaker' }>
			{ type === 'post' ? translate( 'Promote post' ) : translate( 'Promote page' ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuPromote.propTypes = {
	bumpStatKey: PropTypes.string,
	globalId: PropTypes.string,
	postId: PropTypes.number,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		type: post.type,
		postId: post.ID,
		status: post.status,
		password: post.password,
		siteId: getSelectedSiteId( state ),
	};
};

export default connect( mapStateToProps )( localize( PostActionsEllipsisMenuPromote ) );
