/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import Button from 'components/button';
import EditorVisibility from 'post-editor/editor-visibility';

class EditorConfirmationSidebar extends React.Component {
	static propTypes = {
		hideSidebar: React.PropTypes.func,
		isActive: React.PropTypes.bool,
		onPublish: React.PropTypes.func,
		post: React.PropTypes.object,
		site: React.PropTypes.object,
		savedPost: React.PropTypes.object,
		onPrivatePublish: React.PropTypes.func,
	};

	closeAndPublish = () => {
		this.props.hideSidebar();
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
					'is-active': this.props.isActive,
				} ) } >
					<div className={ classnames( {
						'editor-confirmation-sidebar__overlay': true,
						'is-active': this.props.isActive,
					} ) } onClick={ this.props.hideSidebar } />
					<div className={ classnames( {
						'editor-confirmation-sidebar__sidebar': true,
						'is-active': this.props.isActive,
					} ) }>
						<div className="editor-confirmation-sidebar__ground-control">
							<div className="editor-confirmation-sidebar__cancel" onClick={ this.props.hideSidebar }>
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

export default localize( EditorConfirmationSidebar );
