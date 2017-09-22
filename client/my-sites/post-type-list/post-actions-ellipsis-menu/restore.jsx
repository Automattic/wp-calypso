/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { mc } from 'lib/analytics';
import { getCurrentUserId } from 'state/current-user/selectors';
import { restorePost } from 'state/posts/actions';
import { getPost } from 'state/posts/selectors';
import { canCurrentUser } from 'state/selectors';

class PostActionsEllipsisMenuRestore extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		canRestore: PropTypes.bool,
		status: PropTypes.string,
		restorePost: PropTypes.func.isRequired
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

		mc.bumpStat( 'calypso_cpt_actions', 'restore' );
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

export default connect(
	( state, ownProps ) => {
		const post = getPost( state, ownProps.globalId );
		if ( ! post ) {
			return {};
		}

		const userId = getCurrentUserId( state );
		const isAuthor = post.author && post.author.ID === userId;

		return {
			siteId: post.site_ID,
			postId: post.ID,
			status: post.status,
			canRestore: canCurrentUser( state, post.site_ID, isAuthor ? 'delete_posts' : 'delete_others_posts' )
		};
	},
	{ restorePost }
)( localize( PostActionsEllipsisMenuRestore ) );
