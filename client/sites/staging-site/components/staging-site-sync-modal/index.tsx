import {
	Button,
	ExternalLink,
	Modal,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	CheckboxControl,
	SelectControl,
	Notice,
	Tooltip,
} from '@wordpress/components';
import {
	createInterpolateElement,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { error, chevronRight, chevronLeft } from '@wordpress/icons';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import InlineSupportLink from 'calypso/dashboard/components/inline-support-link';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import SiteEnvironmentBadge, {
	EnvironmentType,
} from 'calypso/dashboard/components/site-environment-badge';
import FileBrowser from 'calypso/my-sites/backup/backup-contents-page/file-browser';
import { useFirstMatchingBackupAttempt } from 'calypso/my-sites/backup/hooks';
import {
	usePullFromStagingMutation,
	usePushToStagingMutation,
} from 'calypso/sites/staging-site/hooks/use-staging-sync';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getBackupBrowserNode from 'calypso/state/rewind/selectors/get-backup-browser-node';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';
import type { FileBrowserConfig } from 'calypso/my-sites/backup/backup-contents-page/file-browser';

import './style.scss';

const ROOT_PATH = '/';
const WP_CONFIG_PATH = '/wp-config.php';
const WP_CONTENT_PATH = '/wp-content';
const SQL_PATH = '/sql';

const fileBrowserConfig: FileBrowserConfig = {
	restrictedTypes: [ 'plugin', 'theme' ],
	restrictedPaths: [ 'wp-content' ],
	excludeTypes: [ 'wordpress' ],
	alwaysInclude: [ 'wp-config.php' ],
	showHeaderButtons: false,
	showFileCard: false,
};

const DirectionArrow = () => {
	return (
		<div style={ { marginTop: '44px' } }>
			<Icon
				icon={ isRTL() ? chevronLeft : chevronRight }
				style={ {
					fill: '#949494',
				} }
			/>
		</div>
	);
};

interface EnvironmentLabelProps {
	label: string;
	environmentType: EnvironmentType;
	siteTitle?: string;
}

const EnvironmentLabel = ( { label, environmentType, siteTitle }: EnvironmentLabelProps ) => {
	return (
		<VStack spacing={ 1 }>
			<SectionHeader level={ 3 } title={ label } />
			<HStack spacing={ 2 }>
				<SiteEnvironmentBadge environmentType={ environmentType } />
				{ siteTitle && (
					<Text
						style={ {
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							maxWidth: '190px',
						} }
					>
						{ siteTitle }
					</Text>
				) }
			</HStack>
		</VStack>
	);
};

interface SyncModalProps {
	onClose: () => void;
	syncType: 'pull' | 'push';
	environment: 'production' | 'staging';
	productionSiteId: number;
	stagingSiteId: number;
	onSyncStart: () => void;
}

interface EnvironmentConfig {
	title: string;
	description: string;
	syncFrom: EnvironmentType;
	syncTo: EnvironmentType;
}

interface SyncConfig {
	staging: EnvironmentConfig;
	production: EnvironmentConfig;
	fromLabel: string;
	toLabel: string;
	syncSelectionHeading: string;
	learnMore: string;
	submit: string;
}

const getSyncConfig = ( type: 'pull' | 'push' ): SyncConfig => {
	if ( type === 'pull' ) {
		return {
			staging: {
				title: __( 'Pull from Production' ),
				description: __(
					'Pulling will replace the existing files and database of the staging site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
				),
				syncFrom: 'production',
				syncTo: 'staging',
			},
			production: {
				title: __( 'Pull from Staging' ),
				description: __(
					'Pulling will replace the existing files and database of the production site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
				),
				syncFrom: 'staging',
				syncTo: 'production',
			},
			fromLabel: __( 'Pull' ),
			toLabel: __( 'To' ),
			syncSelectionHeading: __( 'What would you like to pull?' ),
			learnMore: __( 'Read more about <a>environment pull</a>.' ),
			submit: __( 'Pull' ),
		};
	}

	return {
		staging: {
			title: __( 'Push to Production' ),
			description: __(
				'Pushing will replace the existing files and database of the production site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
			),
			syncFrom: 'staging',
			syncTo: 'production',
		},
		production: {
			title: __( 'Push to Staging' ),
			description: __(
				'Pushing will replace the existing files and database of the staging site. An automatic backup of your environment will be created, allowing you to revert changes from the <a>Activity log</a> if needed.'
			),
			syncFrom: 'production',
			syncTo: 'staging',
		},
		fromLabel: __( 'Push' ),
		toLabel: __( 'To' ),
		syncSelectionHeading: __( 'What would you like to push?' ),
		learnMore: __( 'Read more about <a>environment push</a>.' ),
		submit: __( 'Push' ),
	};
};

export default function SyncModal( {
	onClose,
	syncType,
	environment,
	productionSiteId,
	stagingSiteId,
	onSyncStart,
}: SyncModalProps ) {
	const dispatch = useDispatch();
	const syncConfig = getSyncConfig( syncType );
	const [ isFileBrowserVisible, setIsFileBrowserVisible ] = useState( false );
	const [ domainConfirmation, setDomainConfirmation ] = useState( '' );

	const targetEnvironment = syncConfig[ environment ].syncTo;
	const sourceEnvironment = syncConfig[ environment ].syncFrom;

	const productionSiteSlug =
		useSelector( ( state ) => getSiteSlug( state, productionSiteId ) ) || '';
	const stagingSiteSlug = useSelector( ( state ) => getSiteSlug( state, stagingSiteId ) ) || '';

	const productionSiteTitle =
		useSelector( ( state ) => getSiteTitle( state, productionSiteId ) ) || '';
	const stagingSiteTitle = useSelector( ( state ) => getSiteTitle( state, stagingSiteId ) ) || '';

	const targetSiteSlug = targetEnvironment === 'production' ? productionSiteSlug : stagingSiteSlug;
	const sourceSiteSlug = sourceEnvironment === 'staging' ? stagingSiteSlug : productionSiteSlug;

	const sourceSiteTitle = sourceEnvironment === 'staging' ? stagingSiteTitle : productionSiteTitle;
	const targetSiteTitle =
		targetEnvironment === 'production' ? productionSiteTitle : stagingSiteTitle;

	const querySiteId = sourceEnvironment === 'staging' ? stagingSiteId : productionSiteId;

	const getDisplayDate = useGetDisplayDate( querySiteId );

	const browserCheckList = useSelector( ( state ) =>
		getBackupBrowserCheckList( state, querySiteId )
	);

	// Calculate checkbox state based only on visible nodes (wp-content and wp-config.php)
	const wpContentNode = useSelector( ( state ) =>
		getBackupBrowserNode( state, querySiteId, WP_CONTENT_PATH )
	);
	const wpConfigNode = useSelector( ( state ) =>
		getBackupBrowserNode( state, querySiteId, WP_CONFIG_PATH )
	);
	const sqlNode = useSelector( ( state ) => getBackupBrowserNode( state, querySiteId, SQL_PATH ) );

	const isSiteWooStore = !! useSelector( ( state ) => isSiteStore( state, querySiteId ) );
	const filesAndFoldersNodesCheckState = useMemo( () => {
		const nodes = [ wpContentNode, wpConfigNode ].filter( Boolean );
		if ( nodes.length === 0 ) {
			// If nodes don't exist yet, default to 'unchecked' since we set the root to unchecked by default
			return 'unchecked';
		}

		const checkedCount = nodes.filter( ( node ) => node?.checkState === 'checked' ).length;
		const mixedCount = nodes.filter( ( node ) => node?.checkState === 'mixed' ).length;

		if ( mixedCount > 0 ) {
			return 'mixed';
		}

		if ( checkedCount === nodes.length ) {
			return 'checked';
		}

		if ( checkedCount === 0 ) {
			return 'unchecked';
		}

		return 'mixed';
	}, [ wpContentNode, wpConfigNode ] );

	const { pullFromStaging } = usePullFromStagingMutation( productionSiteId, stagingSiteId, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_success' ) );
			// setSyncError( null );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
					code: error.code,
				} )
			);
			// setSyncError( error.code );
		},
	} );

	const { pushToStaging } = usePushToStagingMutation( productionSiteId, stagingSiteId, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_success' ) );
			// setSyncError( null );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_failure', {
					code: error.code,
				} )
			);
			// setSyncError( error.code );
		},
	} );

	const { backupAttempt: lastKnownBackupAttempt } = useFirstMatchingBackupAttempt( querySiteId, {
		sortOrder: 'desc',
		successOnly: true,
	} );
	const rewindId = lastKnownBackupAttempt?.rewindId;

	const shouldDisableGranularSync = ! lastKnownBackupAttempt;

	useEffect( () => {
		if ( shouldDisableGranularSync ) {
			dispatch( setNodeCheckState( querySiteId, ROOT_PATH, 'checked' ) );
			dispatch( setNodeCheckState( querySiteId, WP_CONTENT_PATH, 'checked' ) );
			dispatch( setNodeCheckState( querySiteId, WP_CONFIG_PATH, 'checked' ) );
			dispatch( setNodeCheckState( querySiteId, SQL_PATH, 'checked' ) );
		}
	}, [ dispatch, querySiteId, shouldDisableGranularSync ] );

	const handleConfirm = () => {
		let include_paths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		let exclude_paths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );
		if (
			shouldDisableGranularSync ||
			( filesAndFoldersNodesCheckState === 'checked' && sqlNode?.checkState === 'checked' )
		) {
			// Sync everything
			include_paths = '';
			exclude_paths = '';
		}

		onSyncStart();

		if (
			( syncType === 'pull' && environment === 'production' ) ||
			( syncType === 'push' && environment === 'staging' )
		) {
			pullFromStaging( { types: 'paths', include_paths, exclude_paths } );
		} else {
			pushToStaging( { types: 'paths', include_paths, exclude_paths } );
		}

		onClose();
	};

	const updateFilesAndFoldersCheckState = useCallback(
		( checkState: 'checked' | 'unchecked' | 'mixed' ) => {
			dispatch( setNodeCheckState( querySiteId, WP_CONTENT_PATH, checkState ) );
			dispatch( setNodeCheckState( querySiteId, WP_CONFIG_PATH, checkState ) );
		},
		[ dispatch, querySiteId ]
	);

	const handleDomainConfirmation = useCallback(
		( value: string | undefined ) => setDomainConfirmation( value || '' ),
		[]
	);

	const onCheckboxChange = () => {
		updateFilesAndFoldersCheckState(
			filesAndFoldersNodesCheckState === 'checked' ? 'unchecked' : 'checked'
		);
	};

	const handleDatabaseCheckboxChange = () => {
		if ( sqlNode?.checkState === 'checked' ) {
			dispatch( setNodeCheckState( querySiteId, SQL_PATH, 'unchecked' ) );
		} else {
			dispatch( setNodeCheckState( querySiteId, SQL_PATH, 'checked' ) );
		}
	};

	const handleExpanderChange = ( value: string ) => {
		const isExpanded = value === 'true';
		setIsFileBrowserVisible( isExpanded );

		if ( ! isExpanded ) {
			// When collapsing, select all files
			updateFilesAndFoldersCheckState( 'checked' );
		}
	};

	const showWooCommerceWarning =
		isSiteWooStore && targetEnvironment === 'production' && sqlNode?.checkState === 'checked';

	const showDomainConfirmation =
		targetEnvironment === 'production' &&
		( browserCheckList.totalItems > 0 || browserCheckList.includeList.length > 0 );

	const isButtonDisabled =
		( showDomainConfirmation && domainConfirmation !== productionSiteSlug ) ||
		( browserCheckList.totalItems === 0 && browserCheckList.includeList.length === 0 );

	const displayBackupDate = lastKnownBackupAttempt
		? getDisplayDate( lastKnownBackupAttempt.activityTs, false )
		: null;

	return (
		<Modal
			title={ syncConfig[ environment ].title }
			onRequestClose={ onClose }
			style={ { maxWidth: '668px' } }
		>
			<QueryRewindState siteId={ querySiteId } />
			<VStack spacing={ 6 }>
				<Text>
					{ createInterpolateElement( syncConfig[ environment ].description, {
						a: <ExternalLink href={ `/backup/${ targetSiteSlug }` } children={ null } />,
					} ) }
				</Text>
				<HStack spacing={ 4 } alignment="left">
					<EnvironmentLabel
						label={ syncConfig.fromLabel }
						environmentType={ sourceEnvironment }
						siteTitle={ sourceSiteTitle }
					/>
					<DirectionArrow />
					<EnvironmentLabel
						label={ syncConfig.toLabel }
						environmentType={ targetEnvironment }
						siteTitle={ targetSiteTitle }
					/>
				</HStack>
				<SectionHeader level={ 3 } title={ syncConfig.syncSelectionHeading } />

				<div className="staging-site-card">
					<Tooltip
						text={
							shouldDisableGranularSync
								? __( 'Selective Sync will be enabled automatically once your backup is complete.' )
								: ''
						}
					>
						<HStack spacing={ 2 } justify="space-between" alignment="center">
							<CheckboxControl
								__nextHasNoMarginBottom
								label={ __( 'Files and folders' ) }
								disabled={ shouldDisableGranularSync }
								checked={
									shouldDisableGranularSync || filesAndFoldersNodesCheckState === 'checked'
								}
								indeterminate={ filesAndFoldersNodesCheckState === 'mixed' }
								onChange={ onCheckboxChange }
							/>
							<SelectControl
								style={ shouldDisableGranularSync ? { backgroundColor: 'white' } : {} }
								value={ isFileBrowserVisible ? 'true' : 'false' }
								variant="minimal"
								disabled={ shouldDisableGranularSync }
								options={ [
									{
										label: __( 'All files and folders' ),
										value: 'false',
									},
									{
										label: __( 'Specific files and folders' ),
										value: 'true',
									},
								] }
								onChange={ handleExpanderChange }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								aria-label={ __( 'Select files and folders to sync' ) }
							/>
						</HStack>
					</Tooltip>
					{ /*
					 * Keep the FileBrowser component rendered (using a CSS 'hidden' class instead of conditional rendering)
					 * to ensure its child nodes initialize properly and can be selected by default.
					 */ }
					<div className={ isFileBrowserVisible ? '' : 'hidden' }>
						<FileBrowser
							rewindId={ rewindId }
							siteId={ querySiteId }
							fileBrowserConfig={ fileBrowserConfig }
						/>
					</div>
					<HStack
						alignment="left"
						spacing={ 2 }
						style={ {
							borderTop: '1px solid var(--wp-components-color-gray-300, #ddd)',
							borderBottom: '1px solid var(--wp-components-color-gray-300, #ddd)',
							padding: '16px 0',
							marginTop: '8px',
							marginBottom: '20px',
						} }
					>
						<CheckboxControl
							__nextHasNoMarginBottom
							label={ __( 'Database tables' ) }
							disabled={ shouldDisableGranularSync }
							checked={ shouldDisableGranularSync || sqlNode?.checkState === 'checked' }
							onChange={ handleDatabaseCheckboxChange }
						/>
						<Icon icon={ error } style={ { fill: 'var(--studio-orange-50)' } } />
					</HStack>
					<VStack spacing={ 7 }>
						<HStack alignment="left" spacing={ 1 }>
							<Text color="var(--studio-gray-40)">
								{ displayBackupDate
									? createInterpolateElement( __( 'Backup contents from: <date />.' ), {
											date: <span>{ displayBackupDate }</span>,
									  } )
									: __( 'There are no backups.' ) }{ ' ' }
								<ExternalLink
									href={ `/backup/${ sourceSiteSlug }` }
									children={ __( 'Backup now' ) }
								/>
							</Text>
						</HStack>
						{ showWooCommerceWarning && (
							<Notice status="warning" isDismissible={ false }>
								<Text as="p" weight="bold" style={ { lineHeight: '24px' } }>
									{ __( 'Warning! WooCommerce data will be overwritten.' ) }
								</Text>
								{ createInterpolateElement(
									__(
										'This site has WooCommerce installed. We do not recommend syncing or pushing data from a staging site to live production news sites or sites that use eCommerce plugins. <a>Learn more</a>'
									),
									{
										a: (
											<ExternalLink
												href="https://developer.wordpress.com/docs/developer-tools/staging-sites/sync-staging-production/#staging-to-production"
												children={ null }
											/>
										),
									}
								) }
							</Notice>
						) }
						{ showDomainConfirmation && (
							<VStack>
								<InputControl
									__next40pxDefaultSize
									label={
										<HStack style={ { textTransform: 'none' } } alignment="left" spacing={ 1 }>
											<Text>{ __( "Enter your site's name" ) }</Text>
											<Text color="var(--studio-red-50)">{ productionSiteSlug }</Text>
											<Text>{ __( 'to confirm.' ) }</Text>
										</HStack>
									}
									onChange={ handleDomainConfirmation }
								/>
							</VStack>
						) }
					</VStack>
				</div>
				<HStack className="staging-site-card__footer">
					<HStack>
						<Text className="staging-site-card__footer-text">
							{ createInterpolateElement( syncConfig.learnMore, {
								a: <InlineSupportLink onClick={ onClose } supportContext="hosting-staging-site" />,
							} ) }
						</Text>
					</HStack>

					<HStack justify="flex-end" spacing={ 4 }>
						<Button variant="tertiary" onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button variant="primary" onClick={ handleConfirm } disabled={ isButtonDisabled }>
							{ syncConfig.submit }
						</Button>
					</HStack>
				</HStack>
			</VStack>
		</Modal>
	);
}
