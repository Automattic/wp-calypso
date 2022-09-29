import { useDispatch } from '@wordpress/data';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import {
	recordDSPEntryPoint,
	usePromoteWidget,
	PromoteWidgetStatus,
} from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getPost } from 'calypso/state/posts/selectors';

function PostActionsEllipsisMenuPromote( { globalId, postId, bumpStatKey, status, type } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const keyValue = globalId;
	const { openModal } = useRouteModal( 'blazepress-widget', keyValue );

	const widgetEnabled = usePromoteWidget() === PromoteWidgetStatus.ENABLED;
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
			{ type === 'post' ? translate( 'Promote Post' ) : translate( 'Promote Page' ) }
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
	};
};

export default connect( mapStateToProps )( localize( PostActionsEllipsisMenuPromote ) );
