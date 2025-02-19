import { camelOrSnakeSlug } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card, ExternalLink } from '@automattic/components';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { productHasBackups } from 'calypso/blocks/jetpack-benefits/feature-checks';
import HasRetentionCapabilitiesSwitch from 'calypso/jetpack-cloud/sections/settings/has-retention-capabilities-switch';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { JETPACK_BACKUP_RETENTION_UPDATE_RESET } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { updateBackupRetention } from 'calypso/state/rewind/retention/actions';
import { BACKUP_RETENTION_UPDATE_REQUEST } from 'calypso/state/rewind/retention/constants';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getBackupRetentionDays from 'calypso/state/rewind/selectors/get-backup-retention-days';
import getBackupRetentionUpdateRequestStatus from 'calypso/state/rewind/selectors/get-backup-retention-update-status';
import getBackupStoppedFlag from 'calypso/state/rewind/selectors/get-backup-stopped-flag';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import LoadingPlaceholder from '../loading';
import RetentionConfirmationDialog from '../retention-confirmation-dialog';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from '@automattic/calypso-products';
import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';
import './style.scss';

interface BackupRetentionOptionOnCancelPurchaseProps {
	purchase: WithCamelCaseSlug | WithSnakeCaseSlug;
}

const RetentionOptionOnCancelPurchase: React.FC = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const MINIMUM_RETENTION_TO_OFFER = 2;

	const [ retentionOfferCardVisible, setRetentionOfferCardVisible ] = useState( false );
	const [ confirmationDialogVisible, setConfirmationDialogVisible ] = useState( false );

	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( getSelectedSiteSlug );

	// Retention period included in customer plan
	const planRetentionPeriod = useSelector( ( state ) =>
		getActivityLogVisibleDays( state, siteId )
	);

	// Retention period set by customer (if any)
	const customerRetentionPeriod = useSelector( ( state ) =>
		getBackupRetentionDays( state, siteId )
	);

	const updateRetentionRequestStatus = useSelector( ( state ) =>
		getBackupRetentionUpdateRequestStatus( state, siteId )
	);

	const areBackupsStopped = useSelector( ( state ) => getBackupStoppedFlag( state, siteId ) );

	// The retention days that currently applies for this customer.
	const currentBackupRetention = customerRetentionPeriod || planRetentionPeriod || 0;
	const updateRetentionPeriod = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_retention_submit_click', {
				retention_option: MINIMUM_RETENTION_TO_OFFER,
			} )
		);

		dispatch( updateBackupRetention( siteId, MINIMUM_RETENTION_TO_OFFER as RetentionPeriod ) );
	}, [ dispatch, siteId ] );

	const handleUpdateRetention = useCallback( () => {
		setConfirmationDialogVisible( true );
	}, [] );

	const onClose = useCallback( () => {
		setConfirmationDialogVisible( false );
	}, [] );

	useEffect( () => {
		if (
			updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS ||
			updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.FAILED
		) {
			setConfirmationDialogVisible( false );
			dispatch( {
				type: JETPACK_BACKUP_RETENTION_UPDATE_RESET,
				siteId,
			} );
			if ( updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS ) {
				page.redirect( settingsPath( siteSlug ) );
			}
		}
	}, [ dispatch, siteId, siteSlug, updateRetentionRequestStatus ] );

	useEffect( () => {
		// show only if backups are stopped and current retention > 2 days.
		if ( areBackupsStopped && MINIMUM_RETENTION_TO_OFFER < currentBackupRetention ) {
			setRetentionOfferCardVisible( true );
		} else {
			setRetentionOfferCardVisible( false );
		}
	}, [ areBackupsStopped, currentBackupRetention ] );

	if ( retentionOfferCardVisible ) {
		return (
			<Card className="retention-option-on-cancel-purchase__card">
				<h2>{ translate( 'Out of storage space? Store only two days of backups' ) }</h2>
				<div className="retention-option-on-cancel-purchase__content">
					<p className="retention-option-on-cancel-purchase__summary">
						{ translate(
							'We recommend saving at least the last 7 days of backups. However, you can reduce this setting to %(minimumRetention)d days, as a way to stay within your storage limits. Learn more about {{ExternalLink}}Backup Storage and Retention{{/ExternalLink}}',
							{
								components: {
									ExternalLink: (
										<ExternalLink
											href="https://jetpack.com/support/backup/jetpack-vaultpress-backup-storage-and-retention/"
											target="_blank"
											icon
										/>
									),
								},
								args: { minimumRetention: MINIMUM_RETENTION_TO_OFFER },
							}
						) }
					</p>
				</div>
				<div className="retention-option-on-cancel-purchase__footer">
					<Button
						className="retention-option-on-cancel-purchase__button"
						onClick={ handleUpdateRetention }
					>
						{ translate( 'Confirm and keep subscription' ) }
					</Button>
				</div>
				<RetentionConfirmationDialog
					confirmationDialogVisible={ confirmationDialogVisible }
					retentionSelected={ MINIMUM_RETENTION_TO_OFFER }
					updateRetentionRequestStatus={ updateRetentionRequestStatus }
					onClose={ onClose }
					onConfirmation={ updateRetentionPeriod }
				/>
			</Card>
		);
	}
	return null;
};

const BackupRetentionOptionOnCancelPurchase: React.FC<
	BackupRetentionOptionOnCancelPurchaseProps
> = ( { purchase } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	// show only if the purchase being cancelled includes backups.
	const currentPlanHasBackup = productHasBackups( camelOrSnakeSlug( purchase ) );

	return (
		<>
			{ currentPlanHasBackup && (
				<HasRetentionCapabilitiesSwitch
					siteId={ siteId }
					trueComponent={ <RetentionOptionOnCancelPurchase /> }
					falseComponent={ null }
					loadingComponent={ <LoadingPlaceholder /> }
				/>
			) }
		</>
	);
};

export default BackupRetentionOptionOnCancelPurchase;
