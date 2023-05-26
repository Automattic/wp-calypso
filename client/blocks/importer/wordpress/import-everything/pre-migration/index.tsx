import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { NextButton, Title } from '@automattic/onboarding';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatSlugToURL } from 'calypso/blocks/importer/util';
import MigrationCredentialsForm from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/migration-credentials-form';
import { PreMigrationUpgradePlan } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/upgrade-plan';
import { UpgradePluginInfo } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/upgrade-plugins';
import { FormState } from 'calypso/components/advanced-credentials/form';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { MigrationEnabledResponse } from 'calypso/data/site-migration/types';
import { useMigrationEnabledInfoQuery } from 'calypso/data/site-migration/use-migration-enabled';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCredentials } from 'calypso/state/jetpack/credentials/actions';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import { requestSites } from 'calypso/state/sites/actions';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import { CredentialsHelper } from './credentials-helper';
import { StartImportTrackingProps } from './types';
import './style.scss';

interface PreMigrationProps {
	targetSite: SiteDetails;
	startImport: ( props?: StartImportTrackingProps ) => void;
	isTargetSitePlanCompatible: boolean;
	onContentOnlyClick: () => void;
	isMigrateFromWp: boolean;
}

export const PreMigrationScreen: React.FunctionComponent< PreMigrationProps > = (
	props: PreMigrationProps
) => {
	const {
		startImport,
		targetSite,
		isTargetSitePlanCompatible,
		onContentOnlyClick,
		isMigrateFromWp,
	} = props;

	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showCredentials, setShowCredentials ] = useState( false );
	const [ selectedHost, setSelectedHost ] = useState( 'generic' );
	const [ selectedProtocol, setSelectedProtocol ] = useState< 'ftp' | 'ssh' >( 'ftp' );
	const [ hasLoaded, setHasLoaded ] = useState( false );
	const [ showUpgradePluginInfo, setShowUpgradePluginInfo ] = useState( false );
	const fetchMigrationEnabledOnMount = isTargetSitePlanCompatible ? true : false;
	const [ continueImport, setContinueImport ] = useState( false );
	const urlQueryParams = useQuery();
	const sourceSiteSlug = urlQueryParams.get( 'from' ) ?? '';
	const sourceSiteUrl = formatSlugToURL( sourceSiteSlug );

	const toggleCredentialsForm = () => {
		setShowCredentials( ! showCredentials );
		dispatch( recordTracksEvent( 'calypso_site_migration_credentials_form_toggle' ) );
	};

	const [ sourceSiteId, setSourceSiteId ] = useState( 0 );
	const sourceSite = useSelector( ( state ) => getSite( state, sourceSiteId ) );

	const credentials = useSelector( ( state ) =>
		getJetpackCredentials( state, sourceSiteId, 'main' )
	) as FormState & { abspath: string };

	const hasCredentials = credentials && Object.keys( credentials ).length > 0;

	const isRequestingCredentials = useSelector( ( state ) =>
		isRequestingSiteCredentials( state, sourceSiteId as number )
	);

	const isRequestingAllSites = useSelector( ( state ) => isRequestingSites( state ) );

	const changeCredentialsHelperHost = ( host: string ) => {
		setSelectedHost( host );
	};

	const changeCredentialsProtocol = ( protocol: 'ftp' | 'ssh' ) => {
		setSelectedProtocol( protocol );
	};

	const shouldBlockedByPluginUpgradeCheck = useCallback(
		( data: MigrationEnabledResponse | unknown ) => {
			let shouldBlockedByPluginUpgradeCheck = true;
			if ( ! data ) {
				return shouldBlockedByPluginUpgradeCheck;
			}
			const { jetpack_activated, jetpack_compatible, migration_activated, migration_compatible } =
				data as MigrationEnabledResponse;
			if ( isMigrateFromWp && migration_activated && migration_compatible ) {
				shouldBlockedByPluginUpgradeCheck = false;
			} else if ( jetpack_activated && jetpack_compatible ) {
				shouldBlockedByPluginUpgradeCheck = false;
			}
			return shouldBlockedByPluginUpgradeCheck;
		},
		[ isMigrateFromWp ]
	);

	const checkMigrationEnabledCallback = ( migrationEnabledData: MigrationEnabledResponse ) => {
		const shouldShowUpgradePluginInfo = shouldBlockedByPluginUpgradeCheck( migrationEnabledData );
		setShowUpgradePluginInfo( shouldShowUpgradePluginInfo );
		if ( shouldShowUpgradePluginInfo ) {
			setSourceSiteId( 0 );
			return;
		}
		const { source_blog_id } = migrationEnabledData;
		if ( ! sourceSiteId ) {
			setSourceSiteId( source_blog_id );
			dispatch( requestSites() );
		}
	};

	const {
		refetch,
		isError: migrationEnabledError,
		isFetching: migrationEnabledFetching,
	} = useMigrationEnabledInfoQuery(
		targetSite?.ID ?? 0,
		sourceSiteSlug,
		fetchMigrationEnabledOnMount,
		checkMigrationEnabledCallback
	);

	const onUpgradeAndMigrateClick = () => {
		setContinueImport( true );
		refetch();
	};

	useEffect( () => {
		if ( isTargetSitePlanCompatible && sourceSiteId ) {
			dispatch( getCredentials( sourceSiteId ) );
			setHasLoaded( true );
		}
	}, [ isTargetSitePlanCompatible, sourceSiteId, dispatch ] );

	useEffect( () => {
		if ( migrationEnabledError ) {
			setShowUpgradePluginInfo( true );
		}
	}, [ migrationEnabledError ] );

	useEffect( () => {
		// If we are blocked by plugin upgrade check, we do not need to request sites
		if ( showUpgradePluginInfo || ! continueImport ) {
			return;
		}
		if ( sourceSite ) {
			startImport();
		} else if ( ! isRequestingAllSites ) {
			dispatch( requestSites() );
		}
	}, [
		continueImport,
		sourceSite,
		isRequestingAllSites,
		startImport,
		dispatch,
		showUpgradePluginInfo,
	] );

	function renderCredentialsFormSection() {
		// We do not show the credentials form if we already have credentials
		if ( hasCredentials ) {
			return;
		}

		return (
			<>
				{ ! showCredentials && (
					<div className="pre-migration__content pre-migration__credentials">
						{ translate(
							'Want to speed up the migration? {{button}}Provide the server credentials{{/button}} of your site',
							{
								components: {
									button: (
										<Button
											borderless={ true }
											className="action-buttons__content-only"
											onClick={ toggleCredentialsForm }
										/>
									),
								},
							}
						) }
					</div>
				) }
				{ showCredentials && sourceSite && (
					<div className="pre-migration__form-container pre-migration__credentials-form">
						<div className="pre-migration__form">
							<MigrationCredentialsForm
								sourceSite={ sourceSite }
								targetSite={ targetSite }
								startImport={ startImport }
								selectedHost={ selectedHost }
								onChangeProtocol={ changeCredentialsProtocol }
							/>
						</div>
						<div className="pre-migration__credentials-help">
							<CredentialsHelper
								onHostChange={ changeCredentialsHelperHost }
								selectedProtocol={ selectedProtocol }
							/>
						</div>
					</div>
				) }
			</>
		);
	}

	function renderPreMigration() {
		// Show a loading state when we are trying to fetch existing credentials
		if ( ! hasLoaded || isRequestingCredentials ) {
			return <LoadingEllipsis />;
		}

		return (
			<div
				className={ classnames( 'import__pre-migration import__import-everything', {
					'import__import-everything--redesign': isEnabled( 'onboarding/import-redesign' ),
				} ) }
			>
				<div className="import__heading-title">
					<Title>{ translate( 'You are ready to migrate' ) }</Title>
				</div>
				{ renderCredentialsFormSection() }
				{ ! showCredentials && (
					<div className="import__footer-button-container pre-migration__proceed">
						<NextButton
							type="button"
							onClick={ () =>
								startImport( {
									type: 'without-credentials',
								} )
							}
						>
							{ translate( 'Start migration' ) }
						</NextButton>
					</div>
				) }
			</div>
		);
	}

	function renderUpgradePluginInfo() {
		return (
			<>
				<UpgradePluginInfo isMigrateFromWp={ isMigrateFromWp } sourceSiteUrl={ sourceSiteUrl } />
				<Interval onTick={ refetch } period={ EVERY_FIVE_SECONDS } />
			</>
		);
	}

	function render() {
		// If the source site is not capable of being migrated, we show the update info screen
		if ( showUpgradePluginInfo ) {
			return renderUpgradePluginInfo();
		}

		// If the target site is plan compatible, we show the pre-migration screen
		if ( isTargetSitePlanCompatible ) {
			return renderPreMigration();
		}

		// If the target site is not plan compatible, we show the upgrade plan screen
		return (
			<PreMigrationUpgradePlan
				sourceSiteSlug={ sourceSiteSlug }
				sourceSiteUrl={ sourceSiteUrl }
				targetSite={ targetSite }
				startImport={ onUpgradeAndMigrateClick }
				onContentOnlyClick={ onContentOnlyClick }
				isBusy={ migrationEnabledFetching || isRequestingAllSites }
			/>
		);
	}

	return render();
};

export default PreMigrationScreen;
