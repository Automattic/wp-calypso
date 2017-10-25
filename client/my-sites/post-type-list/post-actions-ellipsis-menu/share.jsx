/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import { getPostType } from 'state/post-types/selectors';
import { toggleSharePanel } from 'state/ui/post-type-list/actions';
import { isPublicizeEnabled } from 'state/selectors';
import config from 'config';

class PostActionsEllipsisMenuShare extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		onClick: PropTypes.func,
		bumpStat: PropTypes.func,
	};

	constructor() {
		super( ...arguments );

		this.sharePost = this.sharePost.bind( this );
	}

	sharePost() {
		this.props.bumpStat();
		this.props.toggleSharePanel( this.props.globalId );
		this.props.onClick(); // hide ellipsis menu
	}

	render() {
		const { translate, status, isPublicizeEnabled: isPublicizeEnabledForSite } = this.props;
		if (
			! config.isEnabled( 'posts/post-type-list' ) ||
			! includes( [ 'publish' ], status ) ||
			! isPublicizeEnabledForSite
		) {
			return null;
		}

		return (
			<PopoverMenuItem onClick={ this.sharePost } icon="share">
				{ translate( 'Share' ) }
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
		isPublicizeEnabled: isPublicizeEnabled( state, post.site_ID, post.type ),
		type: getPostType( state, post.site_ID, post.type ),
	};
};

const mapDispatchToProps = { toggleSharePanel, bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		stateProps.type.name,
		'share',
		dispatchProps.bumpAnalyticsStat
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )(
	localize( PostActionsEllipsisMenuShare )
);
