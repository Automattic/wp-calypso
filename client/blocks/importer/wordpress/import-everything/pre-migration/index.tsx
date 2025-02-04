import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSiteMigrateInfo } from 'calypso/blocks/importer/hooks/use-site-can-migrate';
import { useSiteCredentialsInfo } from 'calypso/blocks/importer/hooks/use-site-credentials-info';
import { formatSlugToURL } from 'calypso/blocks/importer/util';
import { MigrationReady } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/migration-ready';
import { UpdatePluginInfo } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/update-plugins';
import { UpgradePlan } from 'calypso/blocks/importer/wordpress/upgrade-plan';
import QuerySites from 'calypso/components/data/query-sites';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCredentials } from 'calypso/state/jetpack/credentials/actions';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import NotAuthorized from '../../../components/not-authorized';
import { Credentials } from './credentials';
import type { PreMigrationState, StartImportTrackingProps } from './types';

import './style.scss';

interface PreMigrationProps {
	sourceSite?: SiteDetails;
	targetSite: SiteDetails;
	initImportRun?: boolean;
	isTrial?: boolean;
	isMigrateFromWp: boolean;
	isTargetSitePlanCompatible: boolean;
	startImport: ( props?: StartImportTrackingProps ) => void;
	navigateToVerifyEmailStep: () => void;
	onContentOnlyClick: () => void;
	onFreeTrialClick: () => void;
}

export const PreMigrationScreen: React.FunctionComponent< PreMigrationProps > = (
	props: PreMigrationProps
) => {
	const {
		sourceSite,
		targetSite,
		initImportRun,
		isTargetSitePlanCompatible,
		isMigrateFromWp,
		isTrial,
		startImport,
		navigateToVerifyEmailStep,
		onContentOnlyClick,
		onFreeTrialClick,
	} = props;

	const translate = useTranslate();
	const dispatch = useDispatch();
	const urlQueryParams = useQuery();
	const sourceSiteSlug = urlQueryParams.get( 'from' ) ?? '';
	const sourceSiteUrl = formatSlugToURL( sourceSiteSlug );

	const [ renderState, setRenderState ] = useState< PreMigrationState >( 'loading' );
	const [ showCredentials, setShowCredentials ] = useState( false );
	const [ continueImport, setContinueImport ] = useState( false );

	const {
		sourceSiteId,
		fetchMigrationEnabledStatus,
		isFetchingData: isFetchingMigrationData,
		isInitFetchingDone,
		siteCanMigrate,
	} = useSiteMigrateInfo( targetSite.ID, sourceSiteSlug, isTargetSitePlanCompatible );

	const requiresPluginUpdate = siteCanMigrate === false;

	const migrationTrackingProps = useMemo( () => {
		return {
			source_site_id: sourceSiteId,
			source_site_url: sourceSiteUrl,
			target_site_id: targetSite.ID,
			target_site_slug: targetSite.slug,
			is_migrate_from_wp: isMigrateFromWp,
			is_trial: isTrial,
		};
	}, [ sourceSiteId, sourceSiteUrl, targetSite.ID, targetSite.slug, isMigrateFromWp, isTrial ] );

	const toggleCredentialsForm = useCallback( () => {
		setShowCredentials( ( prevShowCredentials ) => ! prevShowCredentials );
		dispatch(
			recordTracksEvent( 'calypso_site_migration_credentials_form_toggle', migrationTrackingProps )
		);
	}, [ dispatch, migrationTrackingProps ] );

	const [ queryTargetSitePlanStatus, setQueryTargetSitePlanStatus ] = useState<
		'init' | 'fetching' | 'fetched'
	>( 'init' );

	const isRequestingTargetSitePlans = useSelector( ( state ) =>
		isRequestingSitePlans( state, targetSite.ID )
	);

	const {
		hasCredentials,
		isRequesting: isFetchingCredentials,
		hasLoaded: hasCredentialLoaded,
	} = useSiteCredentialsInfo( sourceSiteId );

	const onUpgradeAndMigrateClick = () => {
		fetchMigrationEnabledStatus();
		setContinueImport( true );
		startImport( migrationTrackingProps );
	};

	/**
	 * Initiate the migration immediately without the user having to click on the start button
	 * This is used when the query param is set
	 */
	useEffect( () => {
		initImportRun && startImport( { type: 'without-credentials', ...migrationTrackingProps } );
	}, [] );

	/**
	 * Fetch the credentials if the site is eligible for migration
	 */
	useEffect( () => {
		if ( ! sourceSiteId || ! isTargetSitePlanCompatible ) {
			return;
		}
		dispatch( getCredentials( sourceSiteId ) );
	}, [ isTargetSitePlanCompatible, sourceSiteId, dispatch ] );

	/**
	 * Recognize when the plan upgrade is done
	 * and fetch the migration enabled status
	 */
	useEffect( () => {
		if ( queryTargetSitePlanStatus === 'fetching' && ! isRequestingTargetSitePlans ) {
			fetchMigrationEnabledStatus();
			setQueryTargetSitePlanStatus( 'fetched' );
			setContinueImport( true );
		}
	}, [ queryTargetSitePlanStatus, isRequestingTargetSitePlans, fetchMigrationEnabledStatus ] );

	/**
	 * Start (continue) the import after:
	 * - the plugin update
	 * - or the plan upgrade
	 */
	useEffect( () => {
		// If we are blocked by plugin upgrade check or has continueImport set to false, we do not start the migration
		if ( requiresPluginUpdate || ! continueImport ) {
			return;
		}
		sourceSiteId && startImport( migrationTrackingProps );
	}, [ continueImport, sourceSiteId, startImport, requiresPluginUpdate ] );

	/**
	 * Decide the render state based on the current component state
	 */
	useEffect( () => {
		if (
			! isInitFetchingDone &&
			( isFetchingMigrationData || queryTargetSitePlanStatus === 'fetched' )
		) {
			setRenderState( 'loading' );
		} else if ( requiresPluginUpdate ) {
			setRenderState( 'update-plugin' );
		} else if ( ! isTargetSitePlanCompatible ) {
			setRenderState( 'upgrade-plan' );
		} else if ( showCredentials ) {
			setRenderState( 'credentials' );
		} else if ( ! hasCredentialLoaded || isFetchingCredentials || isFetchingMigrationData ) {
			setRenderState( 'loading' );
		} else if ( ! sourceSiteId ) {
			setRenderState( 'not-authorized' );
		} else {
			setRenderState( 'ready' );
		}
	}, [
		sourceSiteId,
		showCredentials,
		requiresPluginUpdate,
		isInitFetchingDone,
		isFetchingCredentials,
		isFetchingMigrationData,
		isTargetSitePlanCompatible,
	] );

	switch ( renderState ) {
		case 'loading':
			return (
				<div className="import-layout__center">
					<LoadingEllipsis />
				</div>
			);

		case 'not-authorized':
			return (
				<NotAuthorized
					type="source-site-not-connected"
					sourceSiteUrl={ sourceSiteUrl }
					targetSiteUrl={ targetSite.URL }
					// After resolving the issue, we need to reload the page to re-fetch initial data
					startImport={ () => window.location.reload() }
				/>
			);

		case 'credentials':
			return (
				<Credentials
					sourceSite={ sourceSite }
					targetSite={ targetSite }
					migrationTrackingProps={ migrationTrackingProps }
					startImport={ startImport }
					allowFtp={ false }
				/>
			);

		case 'update-plugin':
			return (
				<>
					<UpdatePluginInfo
						isMigrateFromWp={ isMigrateFromWp }
						sourceSiteUrl={ sourceSiteUrl }
						migrationTrackingProps={ migrationTrackingProps }
					/>
					<Interval onTick={ fetchMigrationEnabledStatus } period={ EVERY_FIVE_SECONDS } />
				</>
			);

		case 'upgrade-plan':
			return (
				<>
					{ queryTargetSitePlanStatus === 'fetching' && <QuerySites siteId={ targetSite.ID } /> }
					<UpgradePlan
						site={ targetSite }
						navigateToVerifyEmailStep={ navigateToVerifyEmailStep }
						isBusy={ isFetchingMigrationData || queryTargetSitePlanStatus === 'fetched' }
						onFreeTrialClick={ onFreeTrialClick }
						ctaText={ translate( 'Upgrade and migrate' ) }
						onCtaClick={ onUpgradeAndMigrateClick }
						onContentOnlyClick={ onContentOnlyClick }
						trackingEventsProps={ migrationTrackingProps }
					/>
				</>
			);

		case 'ready':
			return (
				<MigrationReady
					sourceSiteSlug={ sourceSiteSlug }
					sourceSiteHasCredentials={ hasCredentials }
					targetSiteId={ targetSite.ID }
					targetSiteSlug={ targetSite.slug }
					migrationTrackingProps={ migrationTrackingProps }
					startImport={ startImport }
					onProvideCredentialsClick={ toggleCredentialsForm }
				/>
			);
	}
};

export default PreMigrationScreen;
