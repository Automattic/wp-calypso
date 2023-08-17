import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import {
	FATAL_ERROR,
	USER_TOKEN_ERROR,
	BLOG_TOKEN_ERROR,
	HTTP_ERROR,
	INACTIVITY_ERROR,
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
	const siteIsAutomatedTransfer = useSelector(
		( state ) => !! isSiteAutomatedTransfer( state, siteId )
	);

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

	const errorType = jetpackConnectionHealth?.error ?? '';

	if ( errorType === DNS_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					'Jetpack is unable to connect to your domain because your domain’s DNS records aren’t pointing to your site.'
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-domain-name'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	if ( errorType === FATAL_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					'Jetpack can’t communicate with your site due to a critical error on the site.'
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-a-critical-error-on-your-site'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	if ( [ USER_TOKEN_ERROR, BLOG_TOKEN_ERROR ].includes( errorType ) ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					'Jetpack can’t communicate with your site because your site isn’t connected.'
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-sites-jetpack-connection'
				) }
				noticeActionText={ translate( 'Learn how to reconnect Jetpack' ) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	if ( errorType === HTTP_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					'Jetpack can’t communicate with your site because your site isn’t responding to requests.'
				) }
				noticeActionHref={ localizeUrl( 'https://wordpress.com/support/why-is-my-site-down/' ) }
				noticeActionText={ translate( 'Learn how to fix' ) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	if ( errorType === INACTIVITY_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					"Jetpack can’t communicate with your site because it hasn't seen your site for 7 days."
				) }
				noticeActionHref={ localizeUrl( 'https://wordpress.com/support/why-is-my-site-down/' ) }
				noticeActionText={ translate( 'Learn how to fix' ) }
			/>
		);
	}

	if ( errorType === PLUGIN_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					'We can’t communicate with your site because the Jetpack plugin is deactivated.'
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-sites-jetpack-connection'
				) }
				noticeActionText={ translate( 'Learn how to reactivate Jetpack' ) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	if ( errorType === GENERIC_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					'Jetpack can’t communicate with your site. Please contact site administrator.'
				) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	return (
		<ErrorNotice
			errorType={ UNKNOWN_ERROR }
			errorText={ translate( 'Jetpack can’t communicate with your site.' ) }
			noticeActionHref={ localizeUrl(
				'https://wordpress.com/support/why-is-my-site-down/#theres-an-issue-with-your-sites-jetpack-connection'
			) }
			noticeActionText={ translate( 'Learn how to fix' ) }
			isAtomic={ siteIsAutomatedTransfer }
		/>
	);
};
