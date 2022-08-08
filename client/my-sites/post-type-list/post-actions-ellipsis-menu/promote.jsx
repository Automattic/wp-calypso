import config from '@automattic/calypso-config';
import { useDispatch } from '@wordpress/data';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { loadDSPWidgetJS, recordDSPEntryPoint, showDSPWidgetModal } from 'calypso/lib/promote-post';
import { getPost } from 'calypso/state/posts/selectors';

function PostActionsEllipsisMenuPromote( { siteId, postId, isModuleActive, bumpStatKey } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		loadDSPWidgetJS();
	}, [] );

	const showDSPWidget = async () => {
		dispatch( recordDSPEntryPoint( bumpStatKey ) );
		await showDSPWidgetModal( siteId, postId );
	};

	if ( ! isModuleActive ) {
		return null;
	}

	return (
		<PopoverMenuItem onClick={ showDSPWidget } icon={ 'speaker' }>
			{ translate( 'Promote Post' ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuPromote.propTypes = {
	bumpStatKey: PropTypes.string,
	isModuleActive: PropTypes.bool,
	postId: PropTypes.number,
	siteId: PropTypes.number,
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
		siteId: post.site_ID,
		status: post.status,
	};
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	return Object.assign( {}, ownProps, stateProps, dispatchProps );
};

export default connect(
	mapStateToProps,
	{},
	mergeProps
)( localize( PostActionsEllipsisMenuPromote ) );
