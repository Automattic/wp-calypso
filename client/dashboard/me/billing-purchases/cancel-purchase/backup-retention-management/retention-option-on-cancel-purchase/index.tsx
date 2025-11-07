import {
	siteBackupPoliciesQuery,
	siteBackupSizeQuery,
	siteByIdQuery,
	siteUpdateRetentionDaysMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalHeading as Heading, Button, ExternalLink } from '@wordpress/components';
import { useEffect, useState, useCallback, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../../../../app/analytics';
import { ButtonStack } from '../../../../../components/button-stack';
import { Card, CardBody } from '../../../../../components/card';
import { settingsPath } from '../../../../../utils/jetpack';
import RetentionConfirmationDialog from '../retention-confirmation-dialog';
import type { SiteRewindPoliciesResponse, Purchase } from '@automattic/api-core';

const BACKUP_RETENTION_UPDATE_REQUEST = {
	UNSUBMITTED: 'unsubmitted',
	PENDING: 'pending',
	SUCCESS: 'success',
	FAILED: 'failed',
} as const;

interface BackupRetentionOptionOnCancelPurchaseProps {
	purchase: Purchase;
	siteId: number;
}

const getActivityLogVisibleDays = (
	siteBackupPolicies: SiteRewindPoliciesResponse
): number | undefined => {
	return siteBackupPolicies?.policies?.activity_log_limit_days ?? undefined;
};

const BackupRetentionOptionOnCancelPurchase: React.FC<
	BackupRetentionOptionOnCancelPurchaseProps
> = ( { purchase, siteId } ) => {
	// show only if the purchase being cancelled includes backups.
	const { recordTracksEvent } = useAnalytics();
	const MINIMUM_RETENTION_TO_OFFER = 2;

	const [ retentionOfferCardVisible, setRetentionOfferCardVisible ] = useState( false );
	const [ confirmationDialogVisible, setConfirmationDialogVisible ] = useState( false );
	const { data: site } = useQuery( siteByIdQuery( siteId ) );
	const siteSlug = site?.slug ?? purchase.site_slug;

	const updateBackupRetentionDaysMutation = useMutation(
		siteUpdateRetentionDaysMutation( purchase.blog_id, MINIMUM_RETENTION_TO_OFFER )
	);
	let updateRetentionRequestStatus: string = BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED;
	if ( updateBackupRetentionDaysMutation.isPending ) {
		updateRetentionRequestStatus = BACKUP_RETENTION_UPDATE_REQUEST.PENDING;
	} else if ( updateBackupRetentionDaysMutation.isSuccess ) {
		updateRetentionRequestStatus = BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS;
	} else if ( updateBackupRetentionDaysMutation.isError ) {
		updateRetentionRequestStatus = BACKUP_RETENTION_UPDATE_REQUEST.FAILED;
	}

	const updateRetentionPeriod = () => {
		recordTracksEvent( 'calypso_jetpack_backup_storage_retention_submit_click', {
			retention_option: MINIMUM_RETENTION_TO_OFFER,
		} );

		updateBackupRetentionDaysMutation.mutate();
	};

	const handleUpdateRetention = useCallback( () => {
		setConfirmationDialogVisible( true );
	}, [] );

	const onClose = useCallback( () => {
		setConfirmationDialogVisible( false );
	}, [] );
	const { data: siteBackupSize, isPending: fetchingSize } = useQuery(
		siteBackupSizeQuery( siteId )
	);
	const { data: siteBackupPolicies, isPending: fetchingPolicies } = useQuery(
		siteBackupPoliciesQuery( siteId )
	);

	const isFetching = fetchingSize || fetchingPolicies;
	const storageLimitBytes = siteBackupPolicies?.policies?.storage_limit_bytes ?? 0;

	// Retention period included in customer plan
	const planRetentionPeriod = siteBackupPolicies && getActivityLogVisibleDays( siteBackupPolicies );

	// Retention period set by customer (if any)
	const customerRetentionPeriod = siteBackupSize?.retention_days ?? undefined;

	const areBackupsStopped = siteBackupSize?.backups_stopped ?? false;

	// The retention days that currently applies for this customer.
	const currentBackupRetention = customerRetentionPeriod || planRetentionPeriod || 0;

	useEffect( () => {
		if (
			updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS ||
			updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.FAILED
		) {
			setConfirmationDialogVisible( false );
			if ( updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS ) {
				window.location.href = settingsPath( siteSlug ?? '' );
			}
		}
	}, [ siteSlug, updateRetentionRequestStatus ] );

	useEffect( () => {
		// show only if backups are stopped and current retention > 2 days.
		if ( areBackupsStopped && MINIMUM_RETENTION_TO_OFFER < currentBackupRetention ) {
			setRetentionOfferCardVisible( true );
		} else {
			setRetentionOfferCardVisible( false );
		}
	}, [ areBackupsStopped, currentBackupRetention ] );

	if ( isFetching ) {
		return null;
	}

	if ( ! ( storageLimitBytes > 0 ) ) {
		return null;
	}

	if ( retentionOfferCardVisible ) {
		return (
			<Card>
				<CardBody style={ { padding: '24px' } }>
					<Heading level={ 5 }>
						{ __( 'Out of storage space? Store only two days of backups' ) }
					</Heading>
					<p>
						{ createInterpolateElement(
							sprintf(
								/* translators: %(minimumRetention)d is a number representing the number of days the backup data will be stored or "retained" on the server. */
								__(
									'We recommend saving at least the last 7 days of backups. However, you can reduce this setting to %(minimumRetention)d days, as a way to stay within your storage limits. Learn more about <ExternalLink>Backup Storage and Retention</ExternalLink>'
								),
								{ minimumRetention: MINIMUM_RETENTION_TO_OFFER }
							),
							{
								ExternalLink: (
									<ExternalLink
										children={ null }
										href="https://jetpack.com/support/backup/jetpack-vaultpress-backup-storage-and-retention/"
									/>
								),
							}
						) }
					</p>
					<ButtonStack>
						<Button
							className="retention-option-on-cancel-purchase__button"
							onClick={ handleUpdateRetention }
						>
							{ __( 'Confirm and keep subscription' ) }
						</Button>
					</ButtonStack>
					<RetentionConfirmationDialog
						confirmationDialogVisible={ confirmationDialogVisible }
						retentionSelected={ MINIMUM_RETENTION_TO_OFFER }
						updateRetentionRequestStatus={ updateRetentionRequestStatus }
						onClose={ onClose }
						onConfirmation={ updateRetentionPeriod }
					/>
				</CardBody>
			</Card>
		);
	}
	return null;
};

export default BackupRetentionOptionOnCancelPurchase;
