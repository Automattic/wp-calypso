/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import Gridicon from 'gridicons';

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
import { getPublishButtonStatus } from 'post-editor/editor-publish-button';

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

	isFutureDated( post ) {
		if ( ! post ) {
			return false;
		}

		const oneMinute = 1000 * 60;

		return post && ( +new Date() + oneMinute < +new Date( post.date ) );
	}

	getPublishButtonLabel( publishButtonStatus ) {
		switch ( publishButtonStatus ) {
			case 'update':
				return this.props.translate( 'Update' );
			case 'schedule':
				return this.props.translate( 'Schedule' );
			case 'publish':
				return this.props.translate( 'Publish' );
			case 'requestReview':
				return this.props.translate( 'Submit for Review' );
		}
	}

	renderPublishButton() {
		if ( ! this.props.site || ! this.props.post || ! this.props.savedPost ) {
			return;
		}

		const publishButtonStatus = getPublishButtonStatus( this.props.site, this.props.post, this.props.savedPost );
		const buttonLabel = this.getPublishButtonLabel( publishButtonStatus );

		return (
			<Button onClick={ this.closeAndPublish }>{ buttonLabel }</Button>
		);
	}

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
							<div className="editor-confirmation-sidebar__close">
								<Button
									borderless
									onClick={ this.closeOverlay }
									title={ this.props.translate( 'Close sidebar' ) }
									aria-label={ this.props.translate( 'Close sidebar' ) }>
									<Gridicon icon="cross" />
								</Button>
							</div>
							<div className="editor-confirmation-sidebar__action">
								{ this.renderPublishButton() }
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
