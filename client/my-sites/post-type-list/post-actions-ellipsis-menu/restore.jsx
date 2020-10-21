/**
 * External dependencies
 *
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat } from 'calypso/state/analytics/actions';
import { bumpStatGenerator } from './utils';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getPost } from 'calypso/state/posts/selectors';
import { restorePost } from 'calypso/state/posts/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

class PostActionsEllipsisMenuRestore extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		canRestore: PropTypes.bool,
		status: PropTypes.string,
		restorePost: PropTypes.func.isRequired,
		bumpStat: PropTypes.func,
	};

	constructor() {
		super( ...arguments );

		this.restorePost = this.restorePost.bind( this );
	}

	restorePost() {
		const { siteId, postId } = this.props;
		if ( ! siteId || ! postId ) {
			return;
		}

		this.props.bumpStat();
		this.props.restorePost( siteId, postId );
	}

	render() {
		const { translate, canRestore, status } = this.props;
		if ( 'trash' !== status || ! canRestore ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.restorePost } icon="undo">
				{ translate( 'Restore' ) }
			</PopoverMenuItem>
		);
	}
}

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	const userId = getCurrentUserId( state );
	const isAuthor = post.author && post.author.ID === userId;

	return {
		siteId: post.site_ID,
		postId: post.ID,
		status: post.status,
		type: post.type,
		canRestore: canCurrentUser(
			state,
			post.site_ID,
			isAuthor ? 'delete_posts' : 'delete_others_posts'
		),
	};
};

const mapDispatchToProps = { restorePost, bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator( stateProps.type, 'restore', dispatchProps.bumpAnalyticsStat );
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuRestore ) );
