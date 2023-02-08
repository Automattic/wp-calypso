import { Button, Card } from '@automattic/components';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useStorageText } from 'calypso/components/backup-storage-space/hooks';
import { useQueryRewindPolicies } from 'calypso/components/data/query-rewind-policies';
import { useQueryRewindSize } from 'calypso/components/data/query-rewind-size';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getRewindBytesAvailable from 'calypso/state/rewind/selectors/get-rewind-bytes-available';
import isRequestingRewindPolicies from 'calypso/state/rewind/selectors/is-requesting-rewind-policies';
import isRequestingRewindSize from 'calypso/state/rewind/selectors/is-requesting-rewind-size';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { RetentionOptions, RetentionRadioOptionType } from './consts';
import { useEstimatedCurrentSiteSize, usePrepareRetentionOptions } from './hooks';
import LoadingPlaceholder from './loading';
import RetentionOptionsControl from './retention-options/retention-options-control';
import './style.scss';

const BackupRetentionManagement: FunctionComponent = () => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	// Query dependencies
	useQueryRewindSize( siteId );
	useQueryRewindPolicies( siteId );

	const translate = useTranslate();

	const disableForm = false;
	const formHasErrors = false;

	const [ retentionSelected, setRetentionSelected ] = useState( 0 );
	const planRetentionPeriod = useSelector( ( state ) =>
		getActivityLogVisibleDays( state, siteId )
	);
	const storageLimitBytes = useSelector( ( state ) =>
		getRewindBytesAvailable( state, siteId )
	) as number;
	const estimatedCurrentSiteSize = useEstimatedCurrentSiteSize();

	const currentSiteSizeText = useStorageText( estimatedCurrentSiteSize );
	const storageLimitText = useStorageText( storageLimitBytes );

	const requestingSize = useSelector( ( state ) => isRequestingRewindSize( state, siteId ) );
	const requestingPolicies = useSelector( ( state ) =>
		isRequestingRewindPolicies( state, siteId )
	);

	const isFetching = requestingSize || requestingPolicies;

	const retentionOptionsCards: Record< number, RetentionRadioOptionType > = {
		[ RetentionOptions.RETENTION_DAYS_7 ]: usePrepareRetentionOptions(
			translate( '7 days' ),
			RetentionOptions.RETENTION_DAYS_7,
			retentionSelected === RetentionOptions.RETENTION_DAYS_7
		),
		[ RetentionOptions.RETENTION_DAYS_30 ]: usePrepareRetentionOptions(
			translate( '30 days' ),
			RetentionOptions.RETENTION_DAYS_30,
			retentionSelected === RetentionOptions.RETENTION_DAYS_30
		),
		[ RetentionOptions.RETENTION_DAYS_120 ]: usePrepareRetentionOptions(
			translate( '120 days' ),
			RetentionOptions.RETENTION_DAYS_120,
			retentionSelected === RetentionOptions.RETENTION_DAYS_120
		),
		[ RetentionOptions.RETENTION_DAYS_365 ]: usePrepareRetentionOptions(
			translate( '1 year' ),
			RetentionOptions.RETENTION_DAYS_365,
			retentionSelected === RetentionOptions.RETENTION_DAYS_365
		),
	};

	// Set the retention period selected when we fetch the current plan retention period
	useEffect( () => {
		if ( planRetentionPeriod && ! retentionSelected ) {
			setRetentionSelected( planRetentionPeriod );
		}
	}, [ planRetentionPeriod, retentionSelected ] );

	const handleUpdateRetention = () => {
		return;
	};

	// Set the retention period selected when the user selects a new option
	const onRetentionSelectionChange = useCallback( ( value: number ) => {
		if ( value ) {
			setRetentionSelected( value );
		}
	}, [] );

	return (
		( isFetching && <LoadingPlaceholder /> ) || (
			<div className="backup-retention-management">
				<Card compact={ true }>
					<h3>{ translate( 'Days of backups saved' ) }</h3>
				</Card>
				<Card>
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
							onChange={ onRetentionSelectionChange }
							retentionSelected={ retentionSelected }
							retentionOptions={ retentionOptionsCards }
						/>
						<div className="retention-form__disclaimer">
							{ translate(
								'*We estimate the space you need based on your current site size and the selected number of days.'
							) }
						</div>
						<div className="retention-form__additional-storage">
							<div className="additional-storage__label">
								{ translate( 'You need additional storage to choose this setting.' ) }
							</div>
							<div className="additional-storage__cta">
								{ translate( 'Add XXGB additional storage for $X/month' ) }
							</div>
						</div>
						<div className="retention-form__submit">
							<Button
								primary
								onClick={ handleUpdateRetention }
								disabled={ disableForm || formHasErrors }
							>
								{ translate( 'Update settings' ) }
							</Button>
						</div>
					</div>
				</Card>
			</div>
		)
	);
};

export default BackupRetentionManagement;
