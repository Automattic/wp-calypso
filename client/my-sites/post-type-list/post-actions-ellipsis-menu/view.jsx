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
import WebPreview from 'components/web-preview';
import { getPost, getPostPreviewUrl } from 'state/posts/selectors';

class PostActionsEllipsisMenuView extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		previewUrl: PropTypes.string
	};

	constructor() {
		super( ...arguments );

		this.previewPost = this.previewPost.bind( this );
		this.showPreview = this.togglePreview.bind( this, true );
		this.hidePreview = this.togglePreview.bind( this, false );
		this.state = { isPreviewing: false };
	}

	togglePreview( isPreviewing ) {
		this.setState( { isPreviewing } );
	}

	previewPost( event ) {
		this.showPreview();
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
				icon="external"
				target="_blank">
				{ includes( [ 'publish', 'private' ], status )
					? translate( 'View', { context: 'verb' } )
					: translate( 'Preview', { context: 'verb' } ) }
				<WebPreview
					showPreview={ this.state.isPreviewing }
					previewUrl={ previewUrl }
					onClose={ this.hidePreview } />
			</PopoverMenuItem>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
	return {
		status: post ? post.status : null,
		previewUrl: post ? getPostPreviewUrl( state, post.site_ID, post.ID ) : null
	};
} )( localize( PostActionsEllipsisMenuView ) );
