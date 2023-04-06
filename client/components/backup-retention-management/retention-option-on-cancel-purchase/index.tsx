import { isJetpackBackup } from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useQueryRewindSize } from 'calypso/components/data/query-rewind-size';
import ExternalLink from 'calypso/components/external-link';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getBackupRetentionDays from 'calypso/state/rewind/selectors/get-backup-retention-days';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import RetentionConfirmationDialog from '../retention-confirmation-dialog/index.tsx';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from '@automattic/calypso-products';

import './style.scss';

interface BackupRetentionOptionOnCancelPurchaseProps {
	purchase: WithCamelCaseSlug | WithSnakeCaseSlug;
}

const BackupRetentionOptionOnCancelPurchase: React.FC<
	BackupRetentionOptionOnCancelPurchaseProps
> = ( { purchase } ) => {
	const translate = useTranslate();
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

	const handleUpdateRetention = useCallback( () => {
		setConfirmationDialogVisible( true );
	}, [] );

	useEffect( () => {
		if ( isJetpackBackup( purchase ) && 2 < currentRetentionPlan ) {
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
								args: { minimumRetention: 2 },
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
					retentionSelected={ 2 }
					updateRetentionRequestStatus={ updateRetentionRequestStatus }
				/>
			</Card>
		);
	}
	return null;
};

export default BackupRetentionOptionOnCancelPurchase;
