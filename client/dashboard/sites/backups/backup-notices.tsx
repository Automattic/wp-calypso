import { localizeUrl } from '@automattic/i18n-utils';
import { JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement, useState, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useFormattedTime } from '../../components/formatted-time';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import type { BackupState } from './use-backup-state';
import type { Site } from '@automattic/api-core';

interface BackupNoticesProps {
	backupState: BackupState;
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
}

/**
 * Renders a contextual Notice based on the site's backup status
 */
export function BackupNotices( {
	backupState,
	site,
	timezoneString,
	gmtOffset,
}: BackupNoticesProps ) {
	const { status, backup } = backupState;
	const backupDate = useFormattedTime(
		backup?.started ? backup.started.replace( ' ', 'T' ) + 'Z' : '',
		{
			timeStyle: 'short',
		},
		timezoneString,
		gmtOffset,
		true // Use lowercase calendar label
	);
	const [ isDismissed, setIsDismissed ] = useState( false );

	const handleDismiss = () => {
		setIsDismissed( true );
	};

	useEffect( () => {
		// Reset dismissal when a new backup starts
		if ( status === 'running' ) {
			setIsDismissed( false );
		}
	}, [ status ] );

	if ( status === 'enqueued' ) {
		return (
			<Notice variant="info" title={ __( 'Backup starting…' ) }>
				{ __( 'We’re preparing to make a backup of your site.' ) }
			</Notice>
		);
	}

	if ( status === 'running' ) {
		return (
			<Notice
				variant="info"
				title={ sprintf(
					/* translators: %s is the backup progress percentage. */
					__( 'Generating backup… (%s%% progress)' ),
					backup?.percent ?? '0'
				) }
			>
				{ sprintf(
					/* translators: %s is a date, like "today at 10:00". */
					__( 'We’re making a backup of your site from %s' ),
					backupDate
				) }
			</Notice>
		);
	}

	if ( status === 'success' && ! isDismissed ) {
		return (
			<Notice variant="success" title={ __( 'Backup completed' ) } onClose={ handleDismiss }>
				{ __( 'You’ll be able to access your new backup in just a few minutes.' ) }
			</Notice>
		);
	}

	if ( status === 'error' && ! isDismissed ) {
		return (
			<Notice
				variant="error"
				title={ __( 'Latest backup couldn’t be completed' ) }
				onClose={ handleDismiss }
				actions={
					<Button variant="primary" href={ JETPACK_CONTACT_SUPPORT } target="_blank">
						{ __( 'Contact support' ) }
					</Button>
				}
			>
				{ createInterpolateElement(
					sprintf(
						/* translators: %s is a date, like "today at 10:00" */
						__(
							'We weren’t able to finish your backup from %s, but don’t worry—your existing data is safe. <external>Check our help guide</external> or contact support to get this resolved.'
						),
						backupDate
					),
					{
						external: isSelfHostedJetpackConnected( site ) ? (
							<ExternalLink
								href={ localizeUrl( 'https://jetpack.com/support/backup/' ) }
								children={ null }
							/>
						) : (
							<InlineSupportLink supportContext="backups" children={ null } />
						),
					}
				) }
			</Notice>
		);
	}

	return null;
}
