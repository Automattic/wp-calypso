/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat } from 'calypso/state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getPost } from 'calypso/state/posts/selectors';
import { toggleSharePanel } from 'calypso/state/ui/post-type-list/actions';
import isPublicizeEnabled from 'calypso/state/selectors/is-publicize-enabled';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class PostActionsEllipsisMenuShare extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		type: PropTypes.string,
		isPublicizeEnabled: PropTypes.bool,
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
		const {
			canShare,
			translate,
			status,
			type,
			isPublicizeEnabled: isPublicizeEnabledForSite,
		} = this.props;
		if ( 'publish' !== status || ! isPublicizeEnabledForSite || 'post' !== type || ! canShare ) {
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
		type: post.type,
		isPublicizeEnabled: isPublicizeEnabled( state, post.site_ID, post.type ),
		canShare: canCurrentUser( state, getSelectedSiteId( state ), 'publish_posts' ),
	};
};

const mapDispatchToProps = { toggleSharePanel, bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		stateProps.type,
		'toggle_share_panel',
		dispatchProps.bumpAnalyticsStat
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuShare ) );
