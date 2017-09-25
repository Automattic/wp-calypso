/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import config from 'config';
import { mc } from 'lib/analytics';
import { getPost } from 'state/posts/selectors';
import { isPublicizeEnabled } from 'state/selectors';
import { toggleSharePanel } from 'state/ui/post-type-list/actions';

class PostActionsEllipsisMenuShare extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		onClick: PropTypes.func,
	};

	constructor() {
		super( ...arguments );

		this.sharePost = this.sharePost.bind( this );
	}

	sharePost() {
		mc.bumpStat( 'calypso_cpt_actions', 'share' );
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

export default connect(
	( state, { globalId } ) => {
		const post = getPost( state, globalId );
		if ( ! post ) {
			return {};
		}

		return {
			status: post.status,
			isPublicizeEnabled: isPublicizeEnabled( state, post.site_ID, post.type ),
		};
	}, {
		toggleSharePanel,
	}
)( localize( PostActionsEllipsisMenuShare ) );
