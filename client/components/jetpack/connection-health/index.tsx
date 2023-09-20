import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import {
	DATABASE_ERROR,
	FATAL_ERROR,
	USER_TOKEN_ERROR,
	BLOG_TOKEN_ERROR,
	HTTP_ERROR,
	INACTIVITY_ERROR,
	PLUGIN_ERROR,
	DNS_ERROR,
	UNKNOWN_ERROR,
	GENERIC_ERROR,
	REST_API_ERROR,
	XMLRPC_ERROR,
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
					'https://wordpress.com/support/resolve-jetpack-errors/#domain-s-dns-records'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	if ( errorType === DATABASE_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate( 'Jetpack can’t establish a connection to your site’s database.' ) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/resolve-jetpack-errors/#site-is-missing-database-tables'
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
					'https://wordpress.com/support/resolve-jetpack-errors/#critical-error-on-the-site'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	if ( errorType === REST_API_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					'Jetpack can’t communicate with your site because the REST API is not responding correctly.'
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/resolve-jetpack-errors/#rest-api-or-xml-rpc-is-blocked'
				) }
				noticeActionText={ translate( 'Learn how to fix' ) }
				isAtomic={ siteIsAutomatedTransfer }
			/>
		);
	}

	if ( errorType === XMLRPC_ERROR ) {
		return (
			<ErrorNotice
				errorType={ errorType }
				errorText={ translate(
					'Jetpack can’t communicate with your site because XML-RPC is not responding correctly.'
				) }
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/resolve-jetpack-errors/#rest-api-or-xml-rpc-is-blocked'
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
					'https://wordpress.com/support/resolve-jetpack-errors/#not-connected-to-jetpack'
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
				noticeActionHref={ localizeUrl(
					'https://wordpress.com/support/resolve-jetpack-errors/#jetpack-can-t-communicate'
				) }
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
				noticeActionHref="https://jetpack.com/support/reconnecting-reinstalling-jetpack/"
				noticeActionText={ translate( 'Learn how to fix' ) }
				isAtomic={ siteIsAutomatedTransfer }
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
				noticeActionHref="https://jetpack.com/support/reconnecting-reinstalling-jetpack/"
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
			noticeActionHref={ localizeUrl( 'https://wordpress.com/support/resolve-jetpack-errors/' ) }
			noticeActionText={ translate( 'Learn how to fix' ) }
			isAtomic={ siteIsAutomatedTransfer }
		/>
	);
};
