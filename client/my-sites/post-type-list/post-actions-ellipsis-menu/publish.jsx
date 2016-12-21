/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { mc } from 'lib/analytics';
import { getPost } from 'state/posts/selectors';
import { savePost } from 'state/posts/actions';
import { canCurrentUser } from 'state/selectors';

class PostActionsEllipsisMenuPublish extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		canPublish: PropTypes.bool,
		savePost: PropTypes.func
	};

	constructor() {
		super( ...arguments );

		this.publishPost = this.publishPost.bind( this );
	}

	publishPost() {
		const { siteId, postId } = this.props;
		if ( ! siteId || ! postId ) {
			return;
		}

		mc.bumpStat( 'calypso_cpt_actions', 'publish' );
		this.props.savePost( siteId, postId, { status: 'publish' } );
	}

	render() {
		const { translate, status, canPublish } = this.props;
		if ( ! canPublish || ! includes( [ 'pending', 'draft' ], status ) ) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.publishPost } icon="reader">
				{ translate( 'Publish' ) }
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

		return {
			status: post.status,
			siteId: post.site_ID,
			postId: post.ID,
			canPublish: canCurrentUser( state, post.site_ID, 'publish_posts' )
		};
	},
	{ savePost }
)( localize( PostActionsEllipsisMenuPublish ) );
