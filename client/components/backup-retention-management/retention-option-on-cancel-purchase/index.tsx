import { isJetpackBackup } from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryRewindSize } from 'calypso/components/data/query-rewind-size';
import ExternalLink from 'calypso/components/external-link';
import { updateBackupRetention } from 'calypso/state/rewind/retention/actions';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getBackupRetentionDays from 'calypso/state/rewind/selectors/get-backup-retention-days';
import getBackupRetentionUpdateRequestStatus from 'calypso/state/rewind/selectors/get-backup-retention-update-status';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import RetentionConfirmationDialog from '../retention-confirmation-dialog';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from '@automattic/calypso-products';
import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';

import './style.scss';

interface BackupRetentionOptionOnCancelPurchaseProps {
	purchase: WithCamelCaseSlug | WithSnakeCaseSlug;
}

const BackupRetentionOptionOnCancelPurchase: React.FC<
	BackupRetentionOptionOnCancelPurchaseProps
> = ( { purchase } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const MINIMUM_RETENTION_TO_UPDATE = 2;

	const [ shortRetentionOfferCardVisible, setShortRetentionOfferCardVisible ] = useState( false );
	const [ confirmationDialogVisible, setConfirmationDialogVisible ] = useState( false );

	const siteId = useSelector( getSelectedSiteId ) as number;
	useQueryRewindSize( siteId );

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

	// The retention days that currently applies for this customer.
	const currentRetentionPlan = customerRetentionPeriod || planRetentionPeriod || 0;
	const updateRetentionPeriod = useCallback( () => {
		dispatch( updateBackupRetention( siteId, MINIMUM_RETENTION_TO_UPDATE as RetentionPeriod ) );
	}, [ dispatch, siteId ] );

	const handleUpdateRetention = useCallback( () => {
		setConfirmationDialogVisible( true );
	}, [] );

	const onConfirmationClose = useCallback( () => {
		setConfirmationDialogVisible( false );
	}, [] );

	useEffect( () => {
		if ( isJetpackBackup( purchase ) && MINIMUM_RETENTION_TO_UPDATE < currentRetentionPlan ) {
			setShortRetentionOfferCardVisible( true );
		} else {
			setShortRetentionOfferCardVisible( false );
		}
	}, [ purchase, currentRetentionPlan ] );

	if ( shortRetentionOfferCardVisible ) {
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
											rel="noopener noreferrer"
											icon
										/>
									),
								},
								args: { minimumRetention: MINIMUM_RETENTION_TO_UPDATE },
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
					retentionSelected={ MINIMUM_RETENTION_TO_UPDATE }
					updateRetentionRequestStatus={ updateRetentionRequestStatus }
					onConfirmationClose={ onConfirmationClose }
					onConfirmation={ updateRetentionPeriod }
				/>
			</Card>
		);
	}
	return null;
};

export default BackupRetentionOptionOnCancelPurchase;
