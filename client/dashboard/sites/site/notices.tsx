import { localizeUrl } from '@automattic/i18n-utils';
import { JETPACK_SUPPORT_CONNECTION_ISSUES } from '@automattic/urls';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { Notice } from '../../components/notice';
import type { Site } from '@automattic/api-core';
import type { ReactNode } from 'react';

export function InaccessibleJetpackNotice( { error }: { error: Error } ) {
	useEffect( () => {
		logToLogstash( {
			feature: 'calypso_client',
			message: error.message,
			tags: [ 'dashboard', 'jetpack-inaccessible' ],
			properties: {
				path: window.location.href,
			},
		} );
	}, [ error.message ] );

	return (
		<Notice
			variant="error"
			title={ __( 'Your Jetpack site can not be reached at this time.' ) }
			actions={
				<ExternalLink href={ JETPACK_SUPPORT_CONNECTION_ISSUES }>
					{ __( 'Troubleshoot your Jetpack connection' ) }
				</ExternalLink>
			}
		>
			{ error.message }
		</Notice>
	);
}

const FIFTEEN_MINUTES = 15 * 60;

function getJetpackCriticalErrorState(
	site: Site,
	now: number = Math.floor( Date.now() / 1000 )
): 'in-recovery' | 'critical-error' | null {
	const status = site.options?.jetpack_recovery_mode_status;
	if ( ! status ) {
		return null;
	}

	const enteredAt = status.recovery_session_entered_at ?? 0;
	const exitedAt = status.recovery_session_exited_at ?? 0;
	const lastSent = status.recovery_mode_email_last_sent ?? 0;

	if ( enteredAt > 0 && enteredAt > exitedAt ) {
		return 'in-recovery';
	}

	// Suppress for 15 min after a clean exit so a just-resolved error doesn't linger.
	if ( exitedAt >= lastSent && now - exitedAt < FIFTEEN_MINUTES ) {
		return null;
	}

	if ( lastSent > 0 && enteredAt < lastSent ) {
		return 'critical-error';
	}

	return null;
}

export function getJetpackCriticalErrorMessage( site: Site ): ReactNode | null {
	const state = getJetpackCriticalErrorState( site );
	if ( ! state ) {
		return null;
	}

	const isAdmin = !! site.capabilities?.manage_options;

	if ( state === 'in-recovery' ) {
		if ( ! isAdmin ) {
			return __( 'Your site is in recovery mode. A site administrator has been notified.' );
		}
		const adminUrl = site.options?.admin_url;
		return createInterpolateElement(
			__(
				'Your site is in recovery mode. Resume the session in <wpAdminLink/>, or check your site admin email inbox for the recovery link.'
			),
			{
				wpAdminLink: adminUrl ? <a href={ adminUrl }>{ __( 'WP Admin' ) }</a> : <span>{ __( 'WP Admin' ) }</span>,
			}
		);
	}

	return isAdmin
		? __(
				'A critical error has occurred on your site. Please check your site admin email inbox for instructions to troubleshoot.'
		  )
		: __( 'A critical error has occurred on your site. A site administrator has been notified.' );
}

export function JetpackCriticalErrorNotice( { message }: { message: ReactNode } ) {
	return (
		<Notice
			variant="error"
		 __( 'Your Jetpack site can not be reached at this time' ) }
			actions={
				<ExternalLink
					href={ localizeUrl(
						'https://wordpress.com/support/jetpack/resolve-jetpack-errors/#identify-plugin-or-theme-conflicts'
					) }
				>
					{ __( 'Troubleshoot your Jetpack site' ) }
				</ExternalLink>
			}
		>
			{ message }
		</Notice>
	);
}
