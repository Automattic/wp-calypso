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
import { setPreviewUrl } from 'state/ui/actions';
import layoutFocus from 'lib/layout-focus';

class PostActionsEllipsisMenuView extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		previewUrl: PropTypes.string,
		setPreviewUrl: PropTypes.func.isRequired
	};

	constructor() {
		super( ...arguments );

		this.previewPost = this.previewPost.bind( this );
	}

	previewPost( event ) {
		this.props.setPreviewUrl( this.props.previewUrl );
		mc.bumpStat( 'calypso_cpt_actions', 'view' );
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
		return {
			status: post ? post.status : null,
			previewUrl: post ? getPostPreviewUrl( state, post.site_ID, post.ID ) : null
		};
	},
	{ setPreviewUrl }
)( localize( PostActionsEllipsisMenuView ) );
