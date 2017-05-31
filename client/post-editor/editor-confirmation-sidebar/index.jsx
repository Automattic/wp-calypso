/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import Button from 'components/button';
import EditorVisibility from 'post-editor/editor-visibility';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';

class EditorConfirmationSidebar extends React.Component {
	static propTypes = {
		closeOverlay: React.PropTypes.func,
		closeSidebar: React.PropTypes.func,
		isOverlayActive: React.PropTypes.bool,
		isSidebarActive: React.PropTypes.bool,
		onPublish: React.PropTypes.func,
		post: React.PropTypes.object,
		site: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		onPrivatePublish: React.PropTypes.func,
	};

	closeOverlayAndSidebar = () => {
		this.props.closeSidebar();
		this.props.closeOverlay();
	};

	closeAndPublish = () => {
		this.closeOverlayAndSidebar();
		this.props.onPublish( true );
	};

	renderPrivacyControl() {
		if ( ! this.props.post ) {
			return;
		}

		const { password, type, status } = this.props.post || {};
		const isPrivateSite = this.props.site && this.props.site.is_private;
		const savedStatus = this.props.savedPost ? this.props.savedPost.status : null;
		const savedPassword = this.props.savedPost ? this.props.savedPost.password : null;
		const props = {
			onPrivatePublish: this.props.onPrivatePublish,
			isPrivateSite,
			type,
			password,
			status,
			savedStatus,
			savedPassword
		};

		return (
			<EditorVisibility { ...props } />
		);
	}

	render() {
		return (
			<RootChild>
				<div className={ classnames( {
					'editor-confirmation-sidebar': true,
					'is-active': this.props.isOverlayActive || this.props.isSidebarActive,
				} ) } >
					<div className={ classnames( {
						'editor-confirmation-sidebar__overlay': true,
						'is-active': this.props.isOverlayActive,
					} ) } onClick={ this.closeOverlayAndSidebar } />
					<div className={ classnames( {
						'editor-confirmation-sidebar__sidebar': true,
						'is-active': this.props.isSidebarActive,
					} ) }>
						<div className="editor-confirmation-sidebar__ground-control">
							<div className="editor-confirmation-sidebar__cancel" onClick={ this.closeOverlayAndSidebar }>
								{ this.props.translate( 'Cancel' ) }
							</div>
							<div className="editor-confirmation-sidebar__action">
								<Button onClick={ this.closeAndPublish } compact>{ this.props.translate( 'Publish' ) }</Button>
							</div>
						</div>
						<div className="editor-confirmation-sidebar__content-wrap">
							<div className="editor-confirmation-sidebar__privacy-control">
								{ this.renderPrivacyControl() }
							</div>
						</div>
					</div>
				</div>
			</RootChild>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );

		return {
			siteId,
			postId,
			post
		};
	},
	{ editPost }
)( localize( EditorConfirmationSidebar ) );
