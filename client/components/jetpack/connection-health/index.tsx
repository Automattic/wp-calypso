import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import {
	FATAL_ERROR,
	USER_TOKEN_ERROR,
	BLOG_TOKEN_ERROR,
	HTTP_ERROR,
	PLUGIN_ERROR,
	DNS_ERROR,
	UNKNOWN_ERROR,
	GENERIC_ERROR,
} from './constants';
import { ErrorNotice } from './error-notice';
import { useCheckJetpackConnectionHealth } from './use-check-jetpack-connection-health';

interface Props {
	siteId: number;
}

export const JetpackConnectionHealthBanner = ( { siteId }: Props ) => {
	const translate = useTranslate();

	const [ isErrorCheckJetpackConnectionHealth, setIsErrorCheckJetpackConnectionHealth ] =
		useState( false );

	const { data: jetpackConnectionHealth, isLoading: isLoadingJetpackConnectionHealth } =
		useCheckJetpackConnectionHealth( siteId, {
			onError: () => {
				setIsErrorCheckJetpackConnectionHealth( true );
			},
		} );

	if (
		isLoadingJetpackConnectionHealth ||
		isErrorCheckJetpackConnectionHealth ||
		jetpackConnectionHealth?.is_healthy
	) {
		return;
	}

	if ( jetpackConnectionHealth?.error === DNS_ERROR ) {
		return (
			<ErrorNotice
				errorType={ jetpackConnectionHealth?.error }
				errorText={ translate(
					"Jetpack is unable to connect to your domain. Please update your domain's DNS records so they're pointed properly to your site."
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-domain-name'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
			/>
		);
	}

	if ( jetpackConnectionHealth?.error === FATAL_ERROR ) {
		return (
			<ErrorNotice
				errorType={ jetpackConnectionHealth?.error }
				errorText={ translate(
					"Jetpack is unable to communicate with your site due to a critical error that has occurred there. Please check your site admin's email inbox for instructions."
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-a-critical-error-on-your-site'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
			/>
		);
	}

	if ( [ USER_TOKEN_ERROR, BLOG_TOKEN_ERROR ].includes( jetpackConnectionHealth?.error ) ) {
		return (
			<ErrorNotice
				errorType={ jetpackConnectionHealth?.error }
				errorText={ translate(
					'Jetpack is unable to communicate with your site due to a token error. Please reconnect Jetpack.'
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-sites-jetpack-connection'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
			/>
		);
	}

	if ( jetpackConnectionHealth?.error === HTTP_ERROR ) {
		return (
			<ErrorNotice
				errorType={ jetpackConnectionHealth?.error }
				errorText={ translate(
					'Jetpack is unable to communicate with your site due to a HTTP connection error. Please ensure that your site serves requests.'
				) }
				noticeActionHref={ localizeUrl( 'https://wordpress.com/support/why-is-my-site-down/' ) }
				noticeActionText={ translate( 'Learn how to fix' ) }
			/>
		);
	}

	if ( jetpackConnectionHealth?.error === PLUGIN_ERROR ) {
		return (
			<ErrorNotice
				errorType={ jetpackConnectionHealth?.error }
				errorText={ translate(
					'Jetpack is unable to communicate with your site due to an inactive Jetpack plugin. Please ensure that Jetpack plugin is active and reconnect Jetpack.'
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-sites-jetpack-connection'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
			/>
		);
	}

	if ( jetpackConnectionHealth?.error === GENERIC_ERROR ) {
		return (
			<ErrorNotice
				errorType={ jetpackConnectionHealth?.error }
				errorText={ translate(
					'Jetpack is unable to communicate with your site. Please contact site administrator.'
				) }
			/>
		);
	}

	return (
		<ErrorNotice
			errorType={ UNKNOWN_ERROR }
			errorText={ translate( 'Jetpack is unable to communicate with your site.' ) }
			noticeActionHref={ localizeUrl(
				'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-sites-jetpack-connection'
			) }
			noticeActionText={ translate( 'Learn how to fix' ) }
		/>
	);
};
