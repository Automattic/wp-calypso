/**
 * External dependencies
 */

import React from 'react';
import { useTranslate } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { localizeUrl } from 'calypso/lib/i18n-utils';

export default function Connect( { authUrl } ) {
	const translate = useTranslate();

	return (
		<Main className="auth auth__connect">
			<WordPressLogo size={ 72 } />
			{ ! config( 'oauth_client_id' ) ? (
				<Notice
					status="is-warning"
					text={ translate( 'You need to set `oauth_client_id` in your config file.' ) }
					showDismiss={ false }
				>
					<NoticeAction href="https://developer.wordpress.com/apps/">
						{ translate( 'Go to Developer Resources' ) }
					</NoticeAction>
				</Notice>
			) : (
				<div className="auth__connect-intro">
					<p className="auth__welcome">
						{ translate(
							'Welcome to Calypso. Authorize the application with your WordPress.com credentials to get started.'
						) }
					</p>
					<Button href={ authUrl }>{ translate( 'Authorize App' ) }</Button>
				</div>
			) }
			<a
				className="auth__help"
				target="_blank"
				rel="noopener noreferrer"
				title={ translate( 'Visit the WordPress.com support site for help' ) }
				href={ localizeUrl( 'https://wordpress.com/support/' ) }
			>
				<Gridicon icon="help" />
			</a>
			<div className="auth__links">
				<a href="/start">{ translate( 'Create account' ) }</a>
			</div>
		</Main>
	);
}
