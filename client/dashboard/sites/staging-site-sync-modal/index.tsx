import {
	Button,
	ExternalLink,
	Modal,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
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
}

const EnvironmentLabel = ( { label, environmentType }: EnvironmentLabelProps ) => {
	return (
		<VStack spacing={ 1 } style={ { flex: 1 } }>
			<SectionHeader level={ 3 } title={ label } />
			<InputControl
				readOnly
				prefix={
					<InputControlPrefixWrapper>
						<SiteEnvironmentBadge environmentType={ environmentType } />
					</InputControlPrefixWrapper>
				}
				__next40pxDefaultSize
				tabIndex={ -1 }
				aria-hidden="true"
			/>
		</VStack>
	);
};

interface SyncModalProps {
	onClose: () => void;
	syncType: 'pull' | 'push';
	environment: 'production' | 'staging';
	siteSlug: string;
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

export default function SyncModal( { onClose, syncType, environment, siteSlug }: SyncModalProps ) {
	const syncConfig = getSyncConfig( syncType );

	// TODO: Once we use the component in the Dashbaord V2, let's get siteSlug from Router instead of the passed prop
	//const { siteSlug } = siteRoute.useParams();

	return (
		<Modal
			title={ syncConfig[ environment ].title }
			onRequestClose={ onClose }
			style={ { maxWidth: '668px' } }
		>
			<VStack spacing={ 6 }>
				<VStack spacing={ 7 }>
					<Text>
						{ createInterpolateElement( syncConfig[ environment ].description, {
							a: <ExternalLink href={ `/backup/${ siteSlug }` } children={ null } />,
						} ) }
					</Text>
					<HStack spacing={ 2 } alignment="center">
						<EnvironmentLabel
							label={ syncConfig.fromLabel }
							environmentType={ syncConfig[ environment ].syncFrom }
						/>
						<DirectionArrow />
						<EnvironmentLabel
							label={ syncConfig.toLabel }
							environmentType={ syncConfig[ environment ].syncTo }
						/>
					</HStack>
					<SectionHeader level={ 3 } title={ syncConfig.syncSelectionHeading } />
					<Text>
						{ createInterpolateElement( syncConfig.learnMore, {
							a: <InlineSupportLink onClick={ onClose } supportContext="hosting-staging-site" />,
						} ) }
					</Text>
				</VStack>
				<HStack spacing={ 4 } justify="flex-end" expanded={ false }>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary">{ syncConfig.submit }</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
