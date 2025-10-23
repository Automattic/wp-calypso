import {
	siteByIdQuery,
	pushToStagingMutation,
	pullFromStagingMutation,
} from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	Modal,
	Icon,
	CardDivider,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	CheckboxControl,
	SelectControl,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement, useState, useCallback, useMemo } from '@wordpress/element';
import { __, isRTL, sprintf } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import useRewindableActivityLogQuery from '../../../data/activity-log/use-rewindable-activity-log-query';
import { SUCCESSFUL_BACKUP_ACTIVITIES } from '../../../lib/jetpack/backup-utils';
import FileBrowser from '../../../my-sites/backup/backup-contents-page/file-browser';
import {
	FileBrowserProvider,
	useFileBrowserContext,
} from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import Environment, { EnvironmentType } from '../../components/environment';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import type { FileBrowserConfig } from '../../../my-sites/backup/backup-contents-page/file-browser';
import type { Field } from '@wordpress/dataviews';

// File browser config used for granular selection
const fileBrowserConfig: FileBrowserConfig = {
	restrictedTypes: [ 'plugin', 'theme' ],
	restrictedPaths: [ 'wp-content' ],
	excludeTypes: [ 'wordpress' ],
	alwaysInclude: [ 'wp-config.php' ],
	showFileCard: false,
	showBackupTime: false,
	showSeparateExpandButton: true,
	expandDirectoriesOnClick: false,
	showHeader: false,
};

type BackupActivity = { rewindId: number; activityTs: number };

type StagingSiteSyncFormData = {
	domain: string;
};

const DirectionArrow = () => {
	return (
		<Icon
			icon={ isRTL() ? chevronLeft : chevronRight }
			style={ {
				fill: '#949494',
			} }
		/>
	);
};

interface EnvironmentLabelProps {
	environmentType: EnvironmentType;
	siteTitle?: string;
}

const EnvironmentLabel = ( { environmentType, siteTitle }: EnvironmentLabelProps ) => {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	return (
		<VStack spacing={ 1 }>
			<HStack spacing={ 2 }>
				<Environment environmentType={ environmentType } />
				{ siteTitle && ! isSmallViewport && (
					<Text
						variant="muted"
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
interface EnvironmentConfig {
	title: string;
	subTitle: string;
	description: string;
	syncFrom: EnvironmentType;
	syncTo: EnvironmentType;
}

interface SyncConfig {
	staging: EnvironmentConfig;
	production: EnvironmentConfig;
	learnMore: string;
	submit: string;
}

const getSyncConfig = ( type: 'pull' | 'push' ): SyncConfig => {
	if ( type === 'pull' ) {
		return {
			staging: {
				title: __( 'Pull from Production' ),
				subTitle: __( 'What would you like to pull?' ),
				description: __(
					'Pulling will replace the existing files and database of the staging site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
				),
				syncFrom: 'production',
				syncTo: 'staging',
			},
			production: {
				title: __( 'Pull from Staging' ),
				subTitle: __( 'What would you like to pull?' ),
				description: __(
					'Pulling will replace the existing files and database of the production site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
				),
				syncFrom: 'staging',
				syncTo: 'production',
			},
			learnMore: __( 'Read more about <a>environment pull</a>.' ),
			submit: __( 'Pull' ),
		};
	}

	return {
		staging: {
			title: __( 'Push to Production' ),
			subTitle: __( 'What would you like to push?' ),
			description: __(
				'Pushing will replace the existing files and database of the production site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
			),
			syncFrom: 'staging',
			syncTo: 'production',
		},
		production: {
			title: __( 'Push to Staging' ),
			subTitle: __( 'What would you like to push?' ),
			description: __(
				'Pushing will replace the existing files and database of the staging site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
			),
			syncFrom: 'production',
			syncTo: 'staging',
		},
		learnMore: __( 'Read more about <a>environment push</a>.' ),
		submit: __( 'Push' ),
	};
};

interface StagingSiteSyncModalProps {
	onClose: () => void;
	syncType: 'pull' | 'push';
	environment: 'production' | 'staging';
	productionSiteId: number;
	stagingSiteId: number;
	onSyncStart: () => void;
}

function StagingSiteSyncModalInner( {
	onClose,
	syncType,
	environment,
	productionSiteId,
	stagingSiteId,
	onSyncStart,
}: StagingSiteSyncModalProps ) {
	const syncConfig = getSyncConfig( syncType );
	const { recordTracksEvent } = useAnalytics();
	const [ formData, setFormData ] = useState< StagingSiteSyncFormData >( {
		domain: '',
	} );
	const [ isFileBrowserVisible, setIsFileBrowserVisible ] = useState( false );

	const targetEnvironment = syncConfig[ environment ].syncTo;
	const sourceEnvironment = syncConfig[ environment ].syncFrom;

	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );
	const productionSiteSlug = productionSite?.slug;
	const productionSiteTitle = productionSite?.name;
	const productionHasWoo = !! productionSite?.options?.woocommerce_is_active;

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );
	const stagingSiteSlug = stagingSite?.slug;
	const stagingSiteTitle = stagingSite?.name;
	const stagingHasWoo = !! stagingSite?.options?.woocommerce_is_active;

	const targetSiteSlug = targetEnvironment === 'production' ? productionSiteSlug : stagingSiteSlug;
	const sourceHasWoo = sourceEnvironment === 'staging' ? stagingHasWoo : productionHasWoo;

	const sourceSiteTitle = sourceEnvironment === 'staging' ? stagingSiteTitle : productionSiteTitle;
	const targetSiteTitle =
		targetEnvironment === 'production' ? productionSiteTitle : stagingSiteTitle;

	const querySiteId = sourceEnvironment === 'staging' ? stagingSiteId : productionSiteId;
	const querySiteSlug = sourceEnvironment === 'staging' ? stagingSiteSlug : productionSiteSlug;

	const pullMutation = useMutation( pullFromStagingMutation( productionSiteId, stagingSiteId ) );
	const pushMutation = useMutation( pushToStagingMutation( productionSiteId, stagingSiteId ) );

	const handleClose = useCallback( () => {
		onClose();
	}, [ onClose ] );

	// Determine latest successful backup for rewindId/display
	const activityQuery = useRewindableActivityLogQuery(
		querySiteId,
		{
			name: SUCCESSFUL_BACKUP_ACTIVITIES,
			aggregate: false,
			number: 1,
			sortOrder: 'desc',
		},
		{}
	) as { data: BackupActivity[] | undefined; isLoading: boolean };
	const { data: backupData, isLoading: isLoadingBackupAttempt } = activityQuery;

	const lastKnownBackupAttempt: BackupActivity | undefined = backupData?.[ 0 ];
	const rewindId = lastKnownBackupAttempt?.rewindId ?? 0;

	const { fileBrowserState } = useFileBrowserContext();
	const browserCheckList = fileBrowserState.getCheckList( rewindId );

	const WP_CONFIG_PATH = '/wp-config.php';
	const WP_CONTENT_PATH = '/wp-content';
	const SQL_PATH = '/sql';

	const wpContentNode = fileBrowserState.getNode( WP_CONTENT_PATH, rewindId );
	const wpConfigNode = fileBrowserState.getNode( WP_CONFIG_PATH, rewindId );
	const sqlNode = fileBrowserState.getNode( SQL_PATH, rewindId );

	const filesAndFoldersNodesCheckState = useMemo( () => {
		const nodes = [ wpContentNode, wpConfigNode ].filter( Boolean );
		if ( nodes.length === 0 ) {
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

	const updateFilesAndFoldersCheckState = useCallback(
		( checkState: 'checked' | 'unchecked' | 'mixed' ) => {
			fileBrowserState.setNodeCheckState( WP_CONTENT_PATH, checkState, rewindId );
			fileBrowserState.setNodeCheckState( WP_CONFIG_PATH, checkState, rewindId );
		},
		[ fileBrowserState, rewindId ]
	);

	const onFilesFoldersCheckboxChange = useCallback( () => {
		updateFilesAndFoldersCheckState(
			filesAndFoldersNodesCheckState === 'checked' ? 'unchecked' : 'checked'
		);
	}, [ filesAndFoldersNodesCheckState, updateFilesAndFoldersCheckState ] );

	const handleDatabaseCheckboxChange = useCallback( () => {
		if ( sqlNode?.checkState === 'checked' ) {
			fileBrowserState.setNodeCheckState( SQL_PATH, 'unchecked', rewindId );
		} else {
			fileBrowserState.setNodeCheckState( SQL_PATH, 'checked', rewindId );
		}
	}, [ fileBrowserState, sqlNode, rewindId ] );

	const handleFileSelectionModeChange = useCallback(
		( value: string ) => {
			const isExpanded = value === 'true';
			setIsFileBrowserVisible( isExpanded );
			if ( ! isExpanded ) {
				updateFilesAndFoldersCheckState( 'unchecked' );
			}
		},
		[ updateFilesAndFoldersCheckState ]
	);

	const locale = useLocale();
	const displayBackupDate = lastKnownBackupAttempt
		? new Intl.DateTimeFormat( locale, { dateStyle: 'medium', timeStyle: 'short' } ).format(
				new Date( lastKnownBackupAttempt.activityTs )
		  )
		: null;

	const shouldDisableGranularSync = ! lastKnownBackupAttempt && ! isLoadingBackupAttempt;

	const hasWarning = shouldDisableGranularSync || sqlNode?.checkState === 'checked';
	const showWooCommerceWarning =
		sourceHasWoo && targetEnvironment === 'production' && sqlNode?.checkState === 'checked';

	const handleConfirm = () => {
		let include_paths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		let exclude_paths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		if (
			shouldDisableGranularSync ||
			( filesAndFoldersNodesCheckState === 'checked' && sqlNode?.checkState === 'checked' )
		) {
			include_paths = '';
			exclude_paths = '';
		}

		const options = { types: 'paths', include_paths, exclude_paths } as const;

		if (
			( syncType === 'pull' && environment === 'production' ) ||
			( syncType === 'push' && environment === 'staging' )
		) {
			pullMutation.mutate( options, {
				onSuccess: () => {
					recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_success', {
						types: options.types,
						include_paths: options.include_paths,
						exclude_paths: options.exclude_paths,
					} );
					onSyncStart();
					handleClose();
				},
				onError: ( error: Error ) => {
					recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
						message: error.message,
						types: options.types,
						include_paths: options.include_paths,
						exclude_paths: options.exclude_paths,
					} );
				},
			} );
		} else {
			pushMutation.mutate( options, {
				onSuccess: () => {
					recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_success', {
						types: options.types,
						include_paths: options.include_paths,
						exclude_paths: options.exclude_paths,
					} );
					onSyncStart();
					handleClose();
				},
				onError: ( error: Error ) => {
					recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_failure', {
						message: error.message,
						types: options.types,
						include_paths: options.include_paths,
						exclude_paths: options.exclude_paths,
					} );
				},
			} );
		}
	};

	const showDomainConfirmation = targetEnvironment === 'production' && ! isLoadingBackupAttempt;

	const isSubmitDisabled =
		( showDomainConfirmation && formData.domain !== productionSiteSlug ) ||
		( ! shouldDisableGranularSync &&
			browserCheckList.totalItems === 0 &&
			browserCheckList.includeList.length === 0 &&
			!! lastKnownBackupAttempt ) ||
		pullMutation.isPending ||
		pushMutation.isPending;

	const fields: Field< StagingSiteSyncFormData >[] = [
		{
			id: 'domain',
			label: __( 'Type the site domain to confirm' ),
			type: 'text' as const,
			description: sprintf(
				/* translators: %s: site domain */
				__( 'The site domain is: %s' ),
				productionSiteSlug
			),
		},
	];

	return (
		<Modal title={ syncConfig[ environment ].title } onRequestClose={ handleClose } size="large">
			<VStack spacing={ 5 }>
				<Text>
					{ createInterpolateElement( syncConfig[ environment ].description, {
						a: <ExternalLink href={ `/activity-log/${ targetSiteSlug }` } children={ null } />,
					} ) }
				</Text>
				<HStack spacing={ 4 } alignment="left" style={ { height: '40px' } }>
					<EnvironmentLabel environmentType={ sourceEnvironment } siteTitle={ sourceSiteTitle } />
					<DirectionArrow />
					<EnvironmentLabel environmentType={ targetEnvironment } siteTitle={ targetSiteTitle } />
				</HStack>
				{ ! shouldDisableGranularSync && (
					<>
						<CardDivider />
						<Heading lineHeight="28px" size={ 11 } weight={ 500 } upperCase>
							{ syncConfig[ environment ].subTitle }
						</Heading>
					</>
				) }
				{ /* File selection and database controls */ }
				<VStack spacing={ 5 }>
					{ shouldDisableGranularSync ? (
						<Notice
							density="medium"
							title={ __( 'All files, folders, and database will be synced' ) }
						>
							<VStack spacing={ 2 }>
								<Text as="p">
									{ __(
										'Selective sync is temporarily disabled. Selecting individual items to sync will be enabled automatically once your first backup is complete. Wait a few minutes or run a full sync in the meantime.'
									) }
								</Text>
								{ sourceHasWoo && targetEnvironment === 'production' && (
									<Text as="p">
										{ createInterpolateElement(
											__(
												'This site also has WooCommerce installed. We do not recommend syncing or pushing data from a staging site to live production news sites or sites that use eCommerce plugins. <a>Learn more</a>'
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
									</Text>
								) }
							</VStack>
						</Notice>
					) : (
						<VStack spacing={ 0 }>
							<HStack
								spacing={ 2 }
								justify="space-between"
								alignment="center"
								style={ { padding: '4px 0', marginTop: '-8px' } }
							>
								<CheckboxControl
									__nextHasNoMarginBottom
									label={ __( 'Files and folders' ) }
									disabled={ shouldDisableGranularSync }
									checked={
										shouldDisableGranularSync || filesAndFoldersNodesCheckState === 'checked'
									}
									indeterminate={ filesAndFoldersNodesCheckState === 'mixed' }
									onChange={ onFilesFoldersCheckboxChange }
								/>
								<SelectControl
									value={ isFileBrowserVisible ? 'true' : 'false' }
									variant="minimal"
									disabled={ shouldDisableGranularSync }
									options={ [
										{ label: __( 'All files and folders' ), value: 'false' },
										{ label: __( 'Specific files and folders' ), value: 'true' },
									] }
									onChange={ handleFileSelectionModeChange }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									aria-label={ __( 'Select files and folders to sync' ) }
								/>
							</HStack>

							<div
								hidden={ ! isFileBrowserVisible }
								style={ { border: '1px solid #dcdcde', borderRadius: '2px', padding: '12px 24px' } }
							>
								<VStack spacing={ 4 }>
									<HStack>
										<FileBrowser
											rewindId={ rewindId }
											siteId={ querySiteId }
											siteSlug={ querySiteSlug as string }
											fileBrowserConfig={ fileBrowserConfig }
										/>
									</HStack>
									{ displayBackupDate && (
										<HStack alignment="left" spacing={ 1 }>
											<Text variant="muted">
												{ createInterpolateElement(
													__( 'Content from the latest backup: <date />.' ),
													{
														date: <span>{ displayBackupDate }</span>,
													}
												) }{ ' ' }
												<ExternalLink
													href={ `/backup/${ querySiteSlug as string }` }
													children={ __( 'Create new backup' ) }
												/>
											</Text>
										</HStack>
									) }
								</VStack>
							</div>
							<HStack
								alignment="left"
								spacing={ 2 }
								style={ {
									padding: '16px 0',
									marginTop: isFileBrowserVisible ? '12px' : '0',
								} }
							>
								<CheckboxControl
									__nextHasNoMarginBottom
									label={ __( 'Database' ) }
									disabled={ shouldDisableGranularSync }
									checked={ hasWarning }
									onChange={ handleDatabaseCheckboxChange }
								/>
							</HStack>
							{ hasWarning && (
								<Notice
									density="medium"
									variant="warning"
									title={ __( 'Warning! Database will be overwritten' ) }
								>
									<VStack spacing={ 2 }>
										<Text as="p">
											{ __(
												'Selecting database option will overwrite the site database, including any posts, pages, products, or orders.'
											) }
										</Text>
										{ showWooCommerceWarning && (
											<Text as="p">
												{ createInterpolateElement(
													__(
														'This site also has WooCommerce installed. We do not recommend syncing or pushing data from a staging site to live production news sites or sites that use eCommerce plugins. <a>Learn more</a>'
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
											</Text>
										) }
									</VStack>
								</Notice>
							) }
						</VStack>
					) }

					{ showDomainConfirmation && (
						<DataForm< StagingSiteSyncFormData >
							data={ formData }
							fields={ fields }
							form={ { layout: { type: 'regular' as const }, fields } }
							onChange={ ( edits: Partial< StagingSiteSyncFormData > ) => {
								setFormData( ( data ) => ( {
									...data,
									...edits,
									domain: edits.domain?.trim() ?? data.domain,
								} ) );
							} }
						/>
					) }
					<HStack>
						<HStack>
							<Text>
								{ createInterpolateElement( syncConfig.learnMore, {
									a: (
										<InlineSupportLink
											onClick={ handleClose }
											supportContext="hosting-staging-site"
										/>
									),
								} ) }
							</Text>
						</HStack>

						<ButtonStack justify="flex-end">
							<Button
								variant="tertiary"
								onClick={ handleClose }
								disabled={ pullMutation.isPending || pushMutation.isPending }
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ handleConfirm }
								disabled={ isSubmitDisabled }
								isBusy={ pullMutation.isPending || pushMutation.isPending }
							>
								{ syncConfig.submit }
							</Button>
						</ButtonStack>
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
}

export default function StagingSiteSyncModal( props: StagingSiteSyncModalProps ) {
	const locale = useLocale();

	return (
		<FileBrowserProvider locale={ locale }>
			<StagingSiteSyncModalInner { ...props } />
		</FileBrowserProvider>
	);
}
