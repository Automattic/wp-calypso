/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getPost } from 'state/posts/selectors';
import { savePost } from 'state/posts/actions';
import { canCurrentUser } from 'state/selectors';
import { getPostType } from 'state/post-types/selectors';

class PostActionsEllipsisMenuPublish extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		canPublish: PropTypes.bool,
		savePost: PropTypes.func,
		bumpStat: PropTypes.func,
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

		this.props.bumpStat();
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
		canPublish: canCurrentUser( state, post.site_ID, 'publish_posts' ),
		type: getPostType( state, post.site_ID, post.type ),
	};
};

const mapDispatchToProps = { savePost, bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		stateProps.type.name,
		'publish',
		dispatchProps.bumpAnalyticsStat
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )(
	localize( PostActionsEllipsisMenuPublish )
);
