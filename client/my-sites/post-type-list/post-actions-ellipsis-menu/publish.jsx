/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getPost } from 'calypso/state/posts/selectors';
import { savePost } from 'calypso/state/posts/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';

class PostActionsEllipsisMenuPublish extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		canPublish: PropTypes.bool,
		savePost: PropTypes.func,
		onPublishPost: PropTypes.func,
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

		this.props.onPublishPost();
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

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		status: post.status,
		siteId: post.site_ID,
		postId: post.ID,
		type: post.type,
		canPublish: canCurrentUser( state, post.site_ID, 'publish_posts' ),
	};
};

const mapDispatchToProps = { savePost, bumpStat, recordTracksEvent };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpPublishStat = bumpStatGenerator( stateProps.type, 'publish', dispatchProps.bumpStat );
	const onPublishPost = () => {
		bumpPublishStat();
		dispatchProps.recordTracksEvent( 'calypso_post_type_list_publish', {
			post_type: stateProps.type,
		} );
	};
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { onPublishPost } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuPublish ) );
