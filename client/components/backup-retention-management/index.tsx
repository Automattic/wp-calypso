import { Button, Card, Dialog, Spinner } from '@automattic/components';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStorageText } from 'calypso/components/backup-storage-space/hooks';
import { UpsellPrice } from 'calypso/components/backup-storage-space/usage-warning/upsell';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import { addQueryArgs } from 'calypso/lib/route';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { updateBackupRetention } from 'calypso/state/rewind/retention/actions';
import { BACKUP_RETENTION_UPDATE_REQUEST } from 'calypso/state/rewind/retention/constants';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getBackupCurrentSiteSize from 'calypso/state/rewind/selectors/get-backup-current-site-size';
import getBackupRetentionDays from 'calypso/state/rewind/selectors/get-backup-retention-days';
import getBackupRetentionUpdateRequestStatus from 'calypso/state/rewind/selectors/get-backup-retention-update-status';
import getRewindBytesAvailable from 'calypso/state/rewind/selectors/get-rewind-bytes-available';
import isRequestingRewindPolicies from 'calypso/state/rewind/selectors/is-requesting-rewind-policies';
import isRequestingRewindSize from 'calypso/state/rewind/selectors/is-requesting-rewind-size';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { RETENTION_OPTIONS, STORAGE_ESTIMATION_ADDITIONAL_BUFFER } from './constants';
import InfoTooltip from './info-tooltip';
import LoadingPlaceholder from './loading';
import RetentionOptionsControl from './retention-options/retention-options-control';
import useUpsellInfo from './use-upsell-info';
import type { RetentionOptionInput } from './types';
import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';
import './style.scss';

interface OwnProps {
	defaultRetention?: number;
}

const BackupRetentionManagement: FunctionComponent< OwnProps > = ( { defaultRetention } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId ) as number;

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

	// If a valid defaultRetention is passed, use it. Otherwise, use the current retention period.
	const initializeDefaultRetention = () => {
		if ( defaultRetention && RETENTION_OPTIONS.includes( defaultRetention as RetentionPeriod ) ) {
			return defaultRetention;
		}

		// This is temporary. We should defined a default retention period in the short-term. But given that it will
		// require additional effort to refactor and enforce `RetentionPeriod` we can keep it as 0 for now.
		return 0;
	};
	const [ retentionSelected, setRetentionSelected ] = useState( initializeDefaultRetention );

	// If the current selection requires an storage upgrade
	const [ storageUpgradeRequired, setStorageUpgradeRequired ] = useState( false );

	// The retention days that currently applies for this customer.
	const currentRetentionPlan = customerRetentionPeriod || planRetentionPeriod || 0;

	const storageLimitBytes = useSelector( ( state ) =>
		getRewindBytesAvailable( state, siteId )
	) as number;

	const lastBackupSize = useSelector( ( state ) =>
		getBackupCurrentSiteSize( state, siteId )
	) as number;

	const estimatedCurrentSiteSize = lastBackupSize * ( STORAGE_ESTIMATION_ADDITIONAL_BUFFER + 1 );
	const currentSiteSizeText = useStorageText( estimatedCurrentSiteSize );
	const storageLimitText = useStorageText( storageLimitBytes );

	const retentionOptionsCards = RETENTION_OPTIONS.map( ( retentionDays ) => {
		return {
			id: retentionDays,
			spaceNeededInBytes: estimatedCurrentSiteSize * retentionDays,
			upgradeRequired: estimatedCurrentSiteSize * retentionDays > storageLimitBytes,
		};
	} );

	const updateRetentionRequestStatus = useSelector( ( state ) =>
		getBackupRetentionUpdateRequestStatus( state, siteId )
	);

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;
	const { upsellSlug, originalPrice, isPriceFetching, currencyCode } = useUpsellInfo(
		siteId,
		estimatedCurrentSiteSize,
		retentionSelected,
		storageLimitBytes
	);

	const upgradePrice = (
		<UpsellPrice
			originalPrice={ originalPrice }
			isPriceFetching={ isPriceFetching }
			currencyCode={ currencyCode }
			upsellSlug={ upsellSlug }
		/>
	);

	const goToCheckoutPage = useCallback( () => {
		// The idea is to redirect back to the setting page with the current selected retention period.
		const redirectBackUrl = addQueryArgs( { retention: retentionSelected }, window.location.href );

		const storageUpgradeUrl = buildCheckoutURL( siteSlug, upsellSlug.productSlug, {
			// This `source` flag tells the shopping cart to force "purchase" another storage add-on
			// as opposed to renew the existing one.
			source: 'backup-storage-purchase-not-renewal',

			// This redirects after purchasing the storage add-on
			redirect_to: redirectBackUrl,

			// This redirect back after going back or after removing all products in the shopping cart
			checkoutBackUrl: redirectBackUrl,
		} );

		window.location.href = storageUpgradeUrl;
	}, [ retentionSelected, siteSlug, upsellSlug.productSlug ] );

	// Set the retention period selected when the user selects a new option
	const onRetentionSelectionChange = useCallback(
		( value: number ) => {
			if ( value ) {
				if ( value !== retentionSelected ) {
					setRetentionSelected( value );

					dispatch(
						recordTracksEvent( 'calypso_jetpack_backup_storage_retention_option_click', {
							retention_option: value,
						} )
					);

					const selectedOption = retentionOptionsCards.find(
						( option ) => option.id === value
					) as RetentionOptionInput;

					if ( selectedOption.upgradeRequired !== storageUpgradeRequired ) {
						setStorageUpgradeRequired( selectedOption.upgradeRequired );
					}
				}
			}
		},
		[ dispatch, retentionOptionsCards, retentionSelected, storageUpgradeRequired ]
	);

	const disableFormSubmission =
		! retentionSelected ||
		retentionSelected === currentRetentionPlan ||
		updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.PENDING;

	const [ confirmationDialogVisible, setConfirmationDialogVisible ] = useState( false );
	const onConfirmationClose = useCallback( () => {
		setConfirmationDialogVisible( false );
	}, [] );

	const updateRetentionPeriod = useCallback( () => {
		dispatch( updateBackupRetention( siteId, retentionSelected as RetentionPeriod ) );

		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_retention_submit_click', {
				retention_option: retentionSelected,
			} )
		);
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
		if ( ! isFetching ) {
			setRetentionSelected( currentRetentionPlan );
		}
	}, [ currentRetentionPlan, isFetching ] );

	useEffect( () => {
		if (
			updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS ||
			updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.FAILED
		) {
			setConfirmationDialogVisible( false );
		}
	}, [ updateRetentionRequestStatus ] );

	const updateSettingsButton = (
		<Button primary onClick={ handleUpdateRetention } disabled={ disableFormSubmission }>
			{ updateRetentionRequestStatus !== BACKUP_RETENTION_UPDATE_REQUEST.PENDING ? (
				translate( 'Update settings' )
			) : (
				<Spinner />
			) }
		</Button>
	);

	const purchaseStorageButton = (
		<Button
			primary
			onClick={ goToCheckoutPage }
			disabled={ disableFormSubmission || isPriceFetching }
		>
			{ translate( 'Purchase storage' ) }
		</Button>
	);

	return (
		( isFetching && <LoadingPlaceholder /> ) || (
			<div className="backup-retention-management">
				{ siteId && <QuerySiteProducts siteId={ siteId } /> }
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
						{ storageUpgradeRequired && (
							<div className="retention-form__additional-storage">
								<div className="additional-storage__label">
									{ translate( 'You need additional storage to choose this setting.' ) }
								</div>
								<div className="additional-storage__cta">
									{ translate( 'Add %(storage)s additional storage for {{price/}}', {
										components: { price: upgradePrice },
										args: { storage: upsellSlug.storage },
									} ) }
								</div>
							</div>
						) }
						<div className="retention-form__submit">
							{ storageUpgradeRequired ? purchaseStorageButton : updateSettingsButton }
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
