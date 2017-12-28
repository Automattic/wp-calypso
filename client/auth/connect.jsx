/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import config from 'config';
import Button from 'client/components/button';
import Main from 'client/components/main';
import Notice from 'client/components/notice';
import NoticeAction from 'client/components/notice/notice-action';
import WordPressLogo from 'client/components/wordpress-logo';

class Connect extends React.Component {
	getCreateAccountUrl = () => {
		return config.isEnabled( 'devdocs' )
			? 'https://wordpress.com/start/developer'
			: 'https://wordpress.com/start';
	};

	render() {
		return (
			<Main className="auth auth__connect">
				<WordPressLogo size={ 72 } />
				{ ! config( 'oauth_client_id' ) ? (
					<Notice
						status="is-warning"
						text={ this.props.translate(
							'You need to set `oauth_client_id` in your config file.'
						) }
						showDismiss={ false }
					>
						<NoticeAction href="https://developer.wordpress.com/apps/">
							{ this.props.translate( 'Go to Developer Resources' ) }
						</NoticeAction>
					</Notice>
				) : (
					<div className="auth__connect-intro">
						<p className="auth__welcome">
							{ this.props.translate(
								'Welcome to Calypso. Authorize the application with your WordPress.com credentials to get started.'
							) }
						</p>
						<Button href={ this.props.authUrl }>{ this.props.translate( 'Authorize App' ) }</Button>
					</div>
				) }
				<a
					className="auth__help"
					target="_blank"
					rel="noopener noreferrer"
					title={ this.props.translate( 'Visit the Calypso GitHub repository for help' ) }
					href="https://github.com/Automattic/wp-calypso"
				>
					<Gridicon icon="help" />
				</a>
				<div className="auth__links">
					<a href={ this.getCreateAccountUrl() }>{ this.props.translate( 'Create account' ) }</a>
				</div>
			</Main>
		);
	}
}

export default localize( Connect );
