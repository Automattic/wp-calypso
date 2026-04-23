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

// State machine per RSM-210. Timestamps are Unix seconds.
const FIFTEEN_MINUTES = 15 * 60;
const TWENTY_FOUR_HOURS = 24 * 60 * 60;
const SEVEN_DAYS = 7 * 24 * 60 * 60;

export type JetpackRecoveryState =
	| 'in-recovery'
	| 'recently-recovered'
	| 'needs-recovery'
	| 'expired-unresolved'
	| 'healthy';

export function getJetpackRecoveryState(
	site: Site,
	now: number = Math.floor( Date.now() / 1000 )
): JetpackRecoveryState {
	const status = site.options?.jetpack_recovery_mode_status;
	if ( ! status ) {
		return 'healthy';
	}

	const enteredAt = status.recovery_session_entered_at ?? 0;
	const exitedAt = status.recovery_session_exited_at ?? 0;
	const lastSent = status.recovery_mode_email_last_sent ?? 0;

	if ( enteredAt > 0 && enteredAt > exitedAt ) {
		return 'in-recovery';
	}

	if ( exitedAt >= lastSent && now - exitedAt < FIFTEEN_MINUTES ) {
		return 'recently-recovered';
	}

	if ( lastSent > 0 && enteredAt < lastSent ) {
		const age = now - lastSent;
		if ( age < TWENTY_FOUR_HOURS ) {
			return 'needs-recovery';
		}
		if ( age < SEVEN_DAYS ) {
			return 'expired-unresolved';
		}
	}

	return 'healthy';
}

export function getJetpackCriticalErrorMessage( site: Site ): ReactNode | null {
	const state = getJetpackRecoveryState( site );
	const isAdmin = !! site.capabilities?.manage_options;

	switch ( state ) {
		case 'in-recovery': {
			if ( ! isAdmin ) {
				return __( 'Your site is in recovery mode. A site administrator has been notified.' );
			}
			const adminUrl = site.options?.admin_url;
			return createInterpolateElement(
				__(
					'Your site is in recovery mode. Resume the session in <a>WP Admin</a>, or check your site admin email inbox for the recovery link.'
				),
				{
					a: adminUrl ? <a href={ adminUrl }>WP Admin</a> : <span>WP Admin</span>,
				}
			);
		}
		case 'needs-recovery':
		case 'expired-unresolved':
			return isAdmin
				? __(
						'A critical error has occurred on your site. Please check your site admin email inbox for instructions to troubleshoot.'
				  )
				: __(
						'A critical error has occurred on your site. A site administrator has been notified.'
				  );
		default:
			return null;
	}
}

export function JetpackCriticalErrorNotice( { message }: { message: ReactNode } ) {
	return (
		<Notice
			variant="error"
			title={ __( 'Your Jetpack site can not be reached at this time.' ) }
			actions={
				<ExternalLink
					href={ localizeUrl(
						'https://wordpress.com/support/jetpack/resolve-jetpack-errors/#identify-plugin-or-theme-conflicts'
					) }
				>
					{ __( 'Troubleshoot your Jetpack connection' ) }
				</ExternalLink>
			}
		>
			{ message }
		</Notice>
	);
}
