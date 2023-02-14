import { Button, Card, Dialog, Spinner } from '@automattic/components';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStorageText } from 'calypso/components/backup-storage-space/hooks';
import { useQueryRewindPolicies } from 'calypso/components/data/query-rewind-policies';
import { useQueryRewindSize } from 'calypso/components/data/query-rewind-size';
import { updateBackupRetention } from 'calypso/state/rewind/retention/actions';
import { BACKUP_RETENTION_UPDATE_REQUEST } from 'calypso/state/rewind/retention/constants';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getBackupCurrentSiteSize from 'calypso/state/rewind/selectors/get-backup-current-site-size';
import getBackupRetentionDays from 'calypso/state/rewind/selectors/get-backup-retention-days';
import getBackupRetentionUpdateRequestStatus from 'calypso/state/rewind/selectors/get-backup-retention-update-status';
import getRewindBytesAvailable from 'calypso/state/rewind/selectors/get-rewind-bytes-available';
import isRequestingRewindPolicies from 'calypso/state/rewind/selectors/is-requesting-rewind-policies';
import isRequestingRewindSize from 'calypso/state/rewind/selectors/is-requesting-rewind-size';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { STORAGE_ESTIMATION_ADDITIONAL_BUFFER } from './constants';
import InfoTooltip from './info-tooltip';
import LoadingPlaceholder from './loading';
import RetentionOptionsControl from './retention-options/retention-options-control';
import type { RetentionOptionInput } from './types';
import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';
import './style.scss';

const BackupRetentionManagement: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId ) as number;

	// Query dependencies
	useQueryRewindSize( siteId );
	useQueryRewindPolicies( siteId );
	const requestingSize = useSelector( ( state ) => isRequestingRewindSize( state, siteId ) );
	const requestingPolicies = useSelector( ( state ) =>
		isRequestingRewindPolicies( state, siteId )
	);
	const isFetching = requestingSize || requestingPolicies;

	// Retention period included in customer plan
	const planRetentionPeriod = useSelector( ( state ) =>
		getActivityLogVisibleDays( state, siteId )
	);

	// Retention period set by customer (if any)
	const customerRetentionPeriod = useSelector( ( state ) =>
		getBackupRetentionDays( state, siteId )
	);

	// The retention days option selected by the customer ( or by default )
	const [ retentionSelected, setRetentionSelected ] = useState( 0 );

	// If the current selection requires an storage upgrade
	const [ storageUpgradeRequired, setStorageUpgradeRequired ] = useState( false );

	// The retention days that currently applies for this customer.
	const [ currentRetentionPlan, setCurrentRetentionPlan ] = useState( 0 );
	useEffect( () => {
		if ( isFetching ) {
			return;
		}

		if ( customerRetentionPeriod ) {
			setCurrentRetentionPlan( customerRetentionPeriod );
		} else if ( planRetentionPeriod ) {
			setCurrentRetentionPlan( planRetentionPeriod );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ customerRetentionPeriod, planRetentionPeriod ] );

	const storageLimitBytes = useSelector( ( state ) =>
		getRewindBytesAvailable( state, siteId )
	) as number;

	const lastBackupSize = useSelector( ( state ) =>
		getBackupCurrentSiteSize( state, siteId )
	) as number;

	const estimatedCurrentSiteSize = lastBackupSize * ( STORAGE_ESTIMATION_ADDITIONAL_BUFFER + 1 );
	const currentSiteSizeText = useStorageText( estimatedCurrentSiteSize );
	const storageLimitText = useStorageText( storageLimitBytes );

	const [ retentionOptionsCards, setRetentionOptionsCards ] = useState< RetentionOptionInput[] >( [
		{
			id: 7,
			spaceNeededInBytes: 0,
			upgradeRequired: false,
		},
		{
			id: 30,
			spaceNeededInBytes: 0,
			upgradeRequired: false,
		},
		{
			id: 120,
			spaceNeededInBytes: 0,
			upgradeRequired: false,
		},
		{
			id: 365,
			spaceNeededInBytes: 0,
			upgradeRequired: false,
		},
	] );

	// Update the retention options cards with the correct values dynamically
	useEffect( () => {
		if ( isFetching ) {
			return;
		}

		setRetentionOptionsCards( ( previousOptions ) => {
			const newOptions = previousOptions.map( ( option ) => {
				const spaceNeededInBytes = estimatedCurrentSiteSize * option.id;
				const upgradeRequired = spaceNeededInBytes > storageLimitBytes;

				return {
					...option,
					spaceNeededInBytes,
					upgradeRequired,
				};
			} );

			return newOptions;
		} );
	}, [ estimatedCurrentSiteSize, isFetching, storageLimitBytes ] );

	const updateRetentionRequestStatus = useSelector( ( state ) =>
		getBackupRetentionUpdateRequestStatus( state, siteId )
	);

	// Set the retention period selected when the user selects a new option
	const onRetentionSelectionChange = useCallback(
		( value: number ) => {
			if ( value ) {
				setRetentionSelected( value );
				const selectedOption = retentionOptionsCards.find( ( option ) => option.id === value );
				setStorageUpgradeRequired( selectedOption?.upgradeRequired ?? false );
			}
		},
		[ retentionOptionsCards ]
	);

	const disableFormSubmission =
		! retentionSelected ||
		retentionSelected === currentRetentionPlan ||
		storageUpgradeRequired ||
		updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.PENDING;

	const [ confirmationDialogVisible, setConfirmationDialogVisible ] = useState( false );
	const onConfirmationClose = useCallback( () => {
		setConfirmationDialogVisible( false );
	}, [] );

	const updateRetentionPeriod = useCallback( () => {
		dispatch( updateBackupRetention( siteId, retentionSelected as RetentionPeriod ) );
	}, [ dispatch, retentionSelected, siteId ] );

	const handleUpdateRetention = useCallback( () => {
		if ( ! retentionSelected ) {
			return;
		}

		// Show confirmation dialog if updating retention period to a lower value, otherwise update immediately
		if ( retentionSelected < currentRetentionPlan ) {
			setConfirmationDialogVisible( true );
		} else {
			updateRetentionPeriod();
		}
	}, [ currentRetentionPlan, retentionSelected, updateRetentionPeriod ] );

	// Set the retention period selected when we fetch the current plan retention period
	useEffect( () => {
		if ( currentRetentionPlan && ! retentionSelected ) {
			setRetentionSelected( currentRetentionPlan );
		}
	}, [ currentRetentionPlan, retentionSelected ] );

	useEffect( () => {
		if ( updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS ) {
			// Update the current retention plan to the one updated by the user.
			setCurrentRetentionPlan( retentionSelected );
			setConfirmationDialogVisible( false );
		} else if ( updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.FAILED ) {
			setConfirmationDialogVisible( false );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ updateRetentionRequestStatus ] );

	return (
		( isFetching && <LoadingPlaceholder /> ) || (
			<div className="backup-retention-management">
				<Card compact={ true } className="setting-title">
					<h3>{ translate( 'Days of backups saved' ) } </h3>
					<InfoTooltip />
				</Card>
				<Card className="setting-content">
					<div className="storage-details">
						<div className="storage-details__size">
							<div className="size__label label">{ translate( 'Current site size*' ) }</div>
							<div className="size__value value">{ currentSiteSizeText }</div>
						</div>
						<div className="storage-details__limit">
							<div className="limit__label label">{ translate( 'Space included in plan' ) }</div>
							<div className="limit__value value">{ storageLimitText }</div>
						</div>
					</div>
					<div className="retention-form">
						<div className="retention-form__instructions">
							{ translate( 'Select the number of days you would like your backups to be saved.' ) }
						</div>
						<RetentionOptionsControl
							currentRetentionPlan={ currentRetentionPlan }
							onChange={ onRetentionSelectionChange }
							retentionSelected={ retentionSelected }
							retentionOptions={ retentionOptionsCards }
						/>
						<div className="retention-form__disclaimer">
							{ translate(
								'*We estimate the space you need based on your current site size and the selected number of days.'
							) }
						</div>
						<div className="retention-form__submit">
							<Button primary onClick={ handleUpdateRetention } disabled={ disableFormSubmission }>
								{ updateRetentionRequestStatus !== BACKUP_RETENTION_UPDATE_REQUEST.PENDING ? (
									translate( 'Update settings' )
								) : (
									<Spinner />
								) }
							</Button>
						</div>
						<Dialog
							additionalClassNames="backup-retention-management retention-form__confirmation-dialog"
							isVisible={ confirmationDialogVisible }
							onClose={ onConfirmationClose }
							buttons={ [
								<Button onClick={ onConfirmationClose }>{ translate( 'Cancel' ) }</Button>,
								<Button
									onClick={ updateRetentionPeriod }
									primary
									disabled={ disableFormSubmission }
								>
									{ updateRetentionRequestStatus !== BACKUP_RETENTION_UPDATE_REQUEST.PENDING ? (
										translate( 'Confirm change' )
									) : (
										<Spinner size={ 22 } />
									) }
								</Button>,
							] }
						>
							<h3>{ translate( 'Update settings' ) }</h3>
							<p>
								{ translate(
									'You are about to reduce the number of days your backups are being saved. Backups older than %(retentionDays)s days will be lost.',
									{
										args: { retentionDays: retentionSelected },
									}
								) }
							</p>
						</Dialog>
					</div>
				</Card>
			</div>
		)
	);
};

export default BackupRetentionManagement;
