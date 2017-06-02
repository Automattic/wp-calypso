/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

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
		onPrivatePublish: React.PropTypes.func,
		onPublish: React.PropTypes.func,
		post: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		setState: React.PropTypes.func,
		site: React.PropTypes.object,
		state: React.PropTypes.string,
	};

	closeOverlay = () => {
		this.props.setState( 'closed' );
	};

	closeAndPublish = () => {
		this.closeOverlay();
		this.props.onPublish( true );
	};

	renderPrivacyControl() {
		if ( ! this.props.post ) {
			return;
		}

		const { password, type, status } = this.props.post || {};
		const isPrivateSite = get( this.props, 'site.is_private' );
		const savedStatus = get( this.props, 'savedPost.status' );
		const savedPassword = get( this.props, 'savedPost.password' );
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
		const isSidebarActive = this.props.state === 'open';
		const isOverlayActive = this.props.state !== 'closed';

		return (
			<RootChild>
				<div className={ classnames( {
					'editor-confirmation-sidebar': true,
					'is-active': isOverlayActive,
				} ) } >
					<div className={ classnames( {
						'editor-confirmation-sidebar__overlay': true,
						'is-active': isOverlayActive,
					} ) } onClick={ this.closeOverlay } />
					<div className={ classnames( {
						'editor-confirmation-sidebar__sidebar': true,
						'is-active': isSidebarActive,
					} ) }>
						<div className="editor-confirmation-sidebar__ground-control">
							<div className="editor-confirmation-sidebar__cancel" onClick={ this.closeOverlay }>
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
