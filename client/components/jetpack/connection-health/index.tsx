import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestJetpackConnectionHealthStatus } from 'calypso/state/jetpack-connection-health/actions';
import getJetpackConnectionHealth from 'calypso/state/jetpack-connection-health/selectors/get-jetpack-connection-health';
import getJetpackConnectionHealthRequestError from 'calypso/state/jetpack-connection-health/selectors/get-jetpack-connection-health-request-error';
import { shouldRequestJetpackConnectionHealthStatus } from 'calypso/state/jetpack-connection-health/selectors/should-request-jetpack-connection-health-status';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { AppState } from 'calypso/types';
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

interface Props {
	siteId: number;
}

export const JetpackConnectionHealthBanner = ( { siteId }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteIsAutomatedTransfer = useSelector(
		( state ) => !! isSiteAutomatedTransfer( state, siteId )
	);

	const shouldRequestJetpackConnectionHealth = useSelector( ( state ) =>
		shouldRequestJetpackConnectionHealthStatus( state, siteId )
	);

	const isJetpackConnectionHealthAPIError = useSelector( ( state ) =>
		getJetpackConnectionHealthRequestError( state as AppState, siteId )
	);

	const jetpackConnectionHealth = useSelector( ( state ) =>
		getJetpackConnectionHealth( state as AppState, siteId )
	);

	useEffect( () => {
		if ( ! shouldRequestJetpackConnectionHealth ) {
			return;
		}
		dispatch( requestJetpackConnectionHealthStatus( siteId ) );
	}, [ dispatch, shouldRequestJetpackConnectionHealth, siteId ] );

	if ( isJetpackConnectionHealthAPIError || ! jetpackConnectionHealth?.error ) {
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
