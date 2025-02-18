import { Button, Card, Spinner, ExternalLink } from '@automattic/components';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useStorageText } from 'calypso/components/backup-storage-space/hooks';
import { UpsellPrice } from 'calypso/components/backup-storage-space/usage-warning/upsell';
import useUpsellInfo from 'calypso/components/backup-storage-space/usage-warning/use-upsell-slug';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import { addQueryArgs } from 'calypso/lib/route';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { useDispatch, useSelector } from 'calypso/state';
import { JETPACK_BACKUP_RETENTION_UPDATE_RESET } from 'calypso/state/action-types';
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
import RetentionConfirmationDialog from './retention-confirmation-dialog';
import RetentionOptionsControl from './retention-options/retention-options-control';
import type { RetentionOptionInput } from './types';
import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';
import './style.scss';

interface OwnProps {
	defaultRetention?: number;
	storagePurchased?: boolean;
}

const BackupRetentionManagement: FunctionComponent< OwnProps > = ( {
	defaultRetention,
	storagePurchased,
} ) => {
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
	const [ storageUpgradeRequired, setStorageUpgradeRequired ] = useState< boolean | null >( null );

	// The retention days that currently applies for this customer.
	const currentRetentionPlan = customerRetentionPeriod || planRetentionPeriod || 0;

	const storageLimitBytes = useSelector( ( state ) =>
		getRewindBytesAvailable( state, siteId )
	) as number;

	const lastBackupSize = useSelector( ( state ) =>
		getBackupCurrentSiteSize( state, siteId )
	) as number;

	const hasStorageInfoLoaded = lastBackupSize !== undefined && storageLimitBytes !== undefined;

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
		retentionSelected
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
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_retention_purchase_click', {
				retention_option: retentionSelected,
			} )
		);

		// Clean storage_purchased query param from the URL
		const currentUrl = removeQueryArgs( window.location.href, 'storage_purchased' );

		// The idea is to redirect back to the setting page with the current selected retention period.
		const backUrl = addQueryArgs( { retention: retentionSelected }, currentUrl );

		const purchaseSuccessUrl = addQueryArgs(
			{ retention: retentionSelected, storage_purchased: 1 },
			currentUrl
		);

		const storageUpgradeUrl = buildCheckoutURL( siteSlug, upsellSlug.productSlug, {
			// This `source` flag tells the shopping cart to force "purchase" another storage add-on
			// as opposed to renew the existing one.
			source: 'backup-storage-purchase-not-renewal',

			// This redirects after purchasing the storage add-on
			redirect_to: purchaseSuccessUrl,

			// This redirect back after going back or after removing all products in the shopping cart
			checkoutBackUrl: backUrl,
		} );

		window.location.href = storageUpgradeUrl;
	}, [ dispatch, retentionSelected, siteSlug, upsellSlug.productSlug ] );

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
				}
			}
		},
		[ dispatch, retentionSelected ]
	);

	const disableFormSubmission =
		! retentionSelected ||
		( retentionSelected === currentRetentionPlan && ! storageUpgradeRequired ) ||
		updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.PENDING;

	const [ confirmationDialogVisible, setConfirmationDialogVisible ] = useState( false );
	const onClose = useCallback( () => {
		setConfirmationDialogVisible( false );

		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_retention_confirmation_cancel_click' )
		);
	}, [ dispatch ] );

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
		if ( ! isFetching && ! defaultRetention ) {
			setRetentionSelected( currentRetentionPlan );
		}
	}, [ currentRetentionPlan, defaultRetention, isFetching ] );

	// Determinate if storage upgrade is required when the retention period selected changes
	useEffect( () => {
		const selectedOption = retentionOptionsCards.find(
			( option ) => option.id === retentionSelected
		) as RetentionOptionInput;

		if (
			selectedOption &&
			selectedOption.upgradeRequired !== storageUpgradeRequired &&
			hasStorageInfoLoaded
		) {
			setStorageUpgradeRequired( selectedOption.upgradeRequired );
		}
	}, [ hasStorageInfoLoaded, retentionOptionsCards, retentionSelected, storageUpgradeRequired ] );

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
		}
	}, [ dispatch, siteId, updateRetentionRequestStatus ] );

	// Update retention period automatically after being redirect from checkout
	useEffect( () => {
		/**
		 * This should only work when:
		 * - The retention period selected is the one passed on URL
		 * - The retention period selected is not the current plan
		 * - The storage upgrade is not required. This is because there are cases where
		 *   the storage purchased is not enough to cover the retention period selected.
		 * - storagePurchased query arg is true
		 * - The storage info has been loaded
		 */
		if (
			retentionSelected === defaultRetention &&
			currentRetentionPlan !== defaultRetention &&
			storageUpgradeRequired === false &&
			updateRetentionRequestStatus === BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED &&
			storagePurchased &&
			hasStorageInfoLoaded
		) {
			updateRetentionPeriod();
		}
	}, [
		currentRetentionPlan,
		defaultRetention,
		hasStorageInfoLoaded,
		retentionSelected,
		storagePurchased,
		storageUpgradeRequired,
		updateRetentionPeriod,
		updateRetentionRequestStatus,
	] );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_storage_retention_view' ) );
	}, [ dispatch ] );

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
			{ translate( 'Purchase and update' ) }
		</Button>
	);

	return (
		( isFetching && <LoadingPlaceholder /> ) || (
			<div className="backup-retention-management">
				{ siteId && <QuerySiteProducts siteId={ siteId } /> }
				<Card compact className="setting-title">
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
						{ 2 === currentRetentionPlan && (
							<div className="retention-form__short-retention-notice">
								{ translate(
									"You're currently saving only {{span}}%(currentRetentionPlan)d days{{/span}} of backups as a way to stay within your storage limits. You can change this by selecting a different setting below. Learn more about {{ExternalLink}}Backup Storage and Retention{{/ExternalLink}}",
									{
										components: {
											ExternalLink: (
												<ExternalLink
													href="https://jetpack.com/support/backup/jetpack-vaultpress-backup-storage-and-retention/"
													target="_blank"
													icon
													iconSize={ 14 }
												/>
											),
											span: <span className="highlight-days" />,
										},
										args: { currentRetentionPlan },
									}
								) }
							</div>
						) }
						<RetentionOptionsControl
							currentRetentionPlan={ currentRetentionPlan }
							onChange={ onRetentionSelectionChange }
							retentionSelected={ retentionSelected }
							retentionOptions={ retentionOptionsCards }
						/>
						<div className="retention-form__disclaimer">
							{ translate(
								'*We estimate the space you need based on your current site size. If your site size increases, you may need to purchase a storage add-on.'
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
						<RetentionConfirmationDialog
							confirmationDialogVisible={ confirmationDialogVisible }
							retentionSelected={ retentionSelected }
							updateRetentionRequestStatus={ updateRetentionRequestStatus }
							onClose={ onClose }
							onConfirmation={ updateRetentionPeriod }
							disableFormSubmission={ disableFormSubmission }
						/>
					</div>
				</Card>
			</div>
		)
	);
};

export default BackupRetentionManagement;
