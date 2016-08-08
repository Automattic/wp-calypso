/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { mc } from 'lib/analytics';
import { getPost, getPostPreviewUrl } from 'state/posts/selectors';
import { isSitePreviewable } from 'state/sites/selectors';
import { setPreviewUrl } from 'state/ui/actions';
import layoutFocus from 'lib/layout-focus';

class PostActionsEllipsisMenuView extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		isPreviewable: PropTypes.bool,
		previewUrl: PropTypes.string,
		setPreviewUrl: PropTypes.func.isRequired
	};

	constructor() {
		super( ...arguments );

		this.previewPost = this.previewPost.bind( this );
	}

	previewPost( event ) {
		const { isPreviewable, previewUrl } = this.props;
		mc.bumpStat( 'calypso_cpt_actions', 'view' );
		if ( ! isPreviewable ) {
			return;
		}

		this.props.setPreviewUrl( previewUrl );
		layoutFocus.set( 'preview' );
		event.preventDefault();
	}

	render() {
		const { translate, status, previewUrl } = this.props;
		if ( ! previewUrl ) {
			return null;
		}

		return (
			<PopoverMenuItem
				href={ previewUrl }
				onClick={ this.previewPost }
				icon="visible"
				target="_blank">
				{ includes( [ 'publish', 'private' ], status )
					? translate( 'View', { context: 'verb' } )
					: translate( 'Preview', { context: 'verb' } ) }
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
			isPreviewable: false !== isSitePreviewable( state, post.site_ID ),
			previewUrl: getPostPreviewUrl( state, post.site_ID, post.ID )
		};
	},
	{ setPreviewUrl }
)( localize( PostActionsEllipsisMenuView ) );
