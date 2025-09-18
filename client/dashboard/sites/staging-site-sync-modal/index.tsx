import {
	siteByIdQuery,
	pushToStagingMutation,
	pullFromStagingMutation,
} from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	Modal,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { createInterpolateElement, useState, useCallback } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import { ButtonStack } from '../../components/button-stack';
import Environment, { EnvironmentType } from '../../components/environment';
import InlineSupportLink from '../../components/inline-support-link';

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
	return (
		<VStack spacing={ 1 }>
			<HStack spacing={ 2 }>
				<Environment environmentType={ environmentType } />
				{ siteTitle && (
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

interface StagingSiteSyncModalProps {
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
	learnMore: string;
	submit: string;
}

const getSyncConfig = ( type: 'pull' | 'push' ): SyncConfig => {
	if ( type === 'pull' ) {
		return {
			staging: {
				title: __( 'Pull from Production' ),
				description: __(
					'Pulling will replace the existing files and database of the staging site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
				),
				syncFrom: 'production',
				syncTo: 'staging',
			},
			production: {
				title: __( 'Pull from Staging' ),
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
			description: __(
				'Pushing will replace the existing files and database of the production site. An automatic backup will be created of your environment, so you can revert it if needed in <a>Activity log</a>.'
			),
			syncFrom: 'staging',
			syncTo: 'production',
		},
		production: {
			title: __( 'Push to Staging' ),
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

export default function StagingSiteSyncModal( {
	onClose,
	syncType,
	environment,
	productionSiteId,
	stagingSiteId,
	onSyncStart,
}: StagingSiteSyncModalProps ) {
	const syncConfig = getSyncConfig( syncType );
	const [ domainConfirmation, setDomainConfirmation ] = useState( '' );

	const targetEnvironment = syncConfig[ environment ].syncTo;
	const sourceEnvironment = syncConfig[ environment ].syncFrom;

	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );
	const productionSiteSlug = productionSite?.slug;
	const productionSiteTitle = productionSite?.name;

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );
	const stagingSiteSlug = stagingSite?.slug;
	const stagingSiteTitle = stagingSite?.name;

	const targetSiteSlug = targetEnvironment === 'production' ? productionSiteSlug : stagingSiteSlug;

	const sourceSiteTitle = sourceEnvironment === 'staging' ? stagingSiteTitle : productionSiteTitle;
	const targetSiteTitle =
		targetEnvironment === 'production' ? productionSiteTitle : stagingSiteTitle;

	// TODO: Uncomment once we need it for granular sync.
	// const querySiteId = sourceEnvironment === 'staging' ? stagingSiteId : productionSiteId;

	const pullMutation = useMutation( pullFromStagingMutation( productionSiteId, stagingSiteId ) );
	const pushMutation = useMutation( pushToStagingMutation( productionSiteId, stagingSiteId ) );

	const handleClose = useCallback( () => {
		onClose();
	}, [ onClose ] );

	const handleConfirm = () => {
		// TODO: Sync everything for now. Later we will add granular sync.
		const options = { types: 'paths', include_paths: '', exclude_paths: '' };

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

	const handleDomainConfirmation = useCallback(
		( value: string | undefined ) => setDomainConfirmation( value || '' ),
		[]
	);

	const showDomainConfirmation = targetEnvironment === 'production';

	const isSubmitDisabled = showDomainConfirmation && domainConfirmation !== productionSiteSlug;

	return (
		<Modal title={ syncConfig[ environment ].title } onRequestClose={ handleClose } size="large">
			<VStack spacing={ 5 }>
				<Text>
					{ createInterpolateElement( syncConfig[ environment ].description, {
						a: <ExternalLink href={ `/activity-log/${ targetSiteSlug }` } children={ null } />,
					} ) }
				</Text>
				<HStack spacing={ 4 } alignment="left">
					<EnvironmentLabel environmentType={ sourceEnvironment } siteTitle={ sourceSiteTitle } />
					<DirectionArrow />
					<EnvironmentLabel environmentType={ targetEnvironment } siteTitle={ targetSiteTitle } />
				</HStack>
				<VStack spacing={ 6 }>
					{ showDomainConfirmation && (
						<InputControl
							__next40pxDefaultSize
							label={
								<HStack style={ { textTransform: 'none' } } alignment="left" spacing={ 1 }>
									<Text>
										{ __( 'Enter your site‘s name' ) }{ ' ' }
										<Text color="var(--dashboard__foreground-color-error)">
											{ productionSiteSlug }
										</Text>{ ' ' }
										{ __( 'to confirm.' ) }
									</Text>
								</HStack>
							}
							onChange={ handleDomainConfirmation }
							value={ domainConfirmation }
						/>
					) }
					<HStack>
						<HStack>
							<Text className="staging-site-card__footer-text">
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
							<Button variant="tertiary" onClick={ handleClose }>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ handleConfirm }
								disabled={ isSubmitDisabled || pullMutation.isPending || pushMutation.isPending }
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
