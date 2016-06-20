/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import WordPressLogo from 'components/wordpress-logo';

const Connect = React.createClass( {

	getCreateAccountUrl() {
		return config.isEnabled( 'devdocs' ) ? 'https://wordpress.com/start/developer' : 'https://wordpress.com/start';
	},

	render() {
		return (
			<Main className="auth auth__connect">
				<WordPressLogo size={ 72 } />
				{ ! config( 'oauth_client_id' )
					? <Notice
						status="is-warning"
						text={ this.translate( 'You need to set `oauth_client_id` in your config file.' ) }
						showDismiss={ false } >
						<NoticeAction href="https://developer.wordpress.com/apps/">{ this.translate( 'Go to Developer Resources' ) }</NoticeAction>
					</Notice>
					: <div className="auth__connect-intro">
						<p className="auth__welcome">
							{ this.translate( 'Welcome to Calypso. Authorize the application with your WordPress.com credentials to get started.' ) }
						</p>
						<Button href={ this.props.authUrl }>{ this.translate( 'Authorize App' ) }</Button>
					</div>
				}
				<a className="auth__help" target="_blank" title={ this.translate( 'Visit the Calypso GitHub repository for help' ) } href="https://github.com/Automattic/wp-calypso">
					<Gridicon icon="help" />
				</a>
				<div className="auth__links">
					<a href={ this.getCreateAccountUrl() }>{ this.translate( 'Create account' ) }</a>
				</div>
			</Main>
		);
	}
} );

export default Connect;
