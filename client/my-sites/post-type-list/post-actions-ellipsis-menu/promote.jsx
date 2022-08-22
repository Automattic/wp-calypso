import config from '@automattic/calypso-config';
import { useDispatch } from '@wordpress/data';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { recordDSPEntryPoint } from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getPost } from 'calypso/state/posts/selectors';

function PostActionsEllipsisMenuPromote( {
	globalId,
	postId,
	isModuleActive,
	bumpStatKey,
	status,
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const keyValue = globalId;
	const { openModal } = useRouteModal( 'blazepress-widget', keyValue );
	if ( ! isModuleActive ) {
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
			{ translate( 'Promote Post' ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuPromote.propTypes = {
	bumpStatKey: PropTypes.string,
	globalId: PropTypes.string,
	isModuleActive: PropTypes.bool,
	postId: PropTypes.number,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		type: post.type,
		isModuleActive: config.isEnabled( 'promote-post' ),
		postId: post.ID,
		status: post.status,
	};
};

export default connect( mapStateToProps )( localize( PostActionsEllipsisMenuPromote ) );
