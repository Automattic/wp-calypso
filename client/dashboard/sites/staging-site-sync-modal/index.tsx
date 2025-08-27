import { useQuery } from '@tanstack/react-query';
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
import { siteByIdQuery } from '../../app/queries/site';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';
import SiteEnvironmentBadge, { EnvironmentType } from '../../components/site-environment-badge';

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
	fromLabel: string;
	toLabel: string;
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

	// TODO: Uncomment once we need it.
	// const querySiteId = sourceEnvironment === 'staging' ? stagingSiteId : productionSiteId;

	const handleClose = useCallback( () => {
		onClose();
	}, [ onClose ] );

	const handleConfirm = () => {
		// Sync everything
		// TODO: Uncomment once pullFromStaging and pushToStaging are available
		// const include_paths = '';
		// const exclude_paths = '';

		if (
			( syncType === 'pull' && environment === 'production' ) ||
			( syncType === 'push' && environment === 'staging' )
		) {
			// TODO: Replace with the correct pullFromStaging (once it is moved to V2)
			// pullFromStaging( { types: 'paths', include_paths, exclude_paths } );
		} else {
			// TODO: Replace with the correct pushToStaging (once it is moved to V2)
			// pushToStaging( { types: 'paths', include_paths, exclude_paths } );
		}
	};

	const handleDomainConfirmation = useCallback(
		( value: string | undefined ) => setDomainConfirmation( value || '' ),
		[]
	);

	const showDomainConfirmation = targetEnvironment === 'production';

	const isSubmitDisabled = showDomainConfirmation && domainConfirmation !== productionSiteSlug;

	return (
		<Modal
			title={ syncConfig[ environment ].title }
			onRequestClose={ handleClose }
			style={ { maxWidth: '668px' } }
		>
			<VStack spacing={ 5 }>
				<Text>
					{ createInterpolateElement( syncConfig[ environment ].description, {
						a: <ExternalLink href={ `/activity-log/${ targetSiteSlug }` } children={ null } />,
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

						<HStack justify="flex-end" spacing={ 4 }>
							<Button variant="tertiary" onClick={ handleClose }>
								{ __( 'Cancel' ) }
							</Button>
							<Button variant="primary" onClick={ handleConfirm } disabled={ isSubmitDisabled }>
								{ syncConfig.submit }
							</Button>
						</HStack>
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
}
