import { JETPACK_SUPPORT_CONNECTION_ISSUES } from '@automattic/urls';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { Notice } from '../../components/notice';
import type { Site } from '@automattic/api-core';

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
			title={ __( 'Your Jetpack site cannot be reached at this time.' ) }
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

export function hasJetpackCriticalError( site: Site ): boolean {
	return getJetpackCriticalErrorState( site ) !== null;
}

export function getJetpackCriticalErrorMessage( site: Site ): string | null {
	if ( ! hasJetpackCriticalError( site ) ) {
		return null;
	}

	const isAdmin = !! site.capabilities?.manage_options;
	return isAdmin
		? __( 'There has been a critical error on this website. Here’s what you can try next:' )
		: __(
				'There has been a critical error on this website. A site administrator has been notified.'
		  );
}
