import {
	siteWordPressMigrationConfigurationQuery,
	siteWordPressMigrationConfigureMutation,
	siteWordPressMigrationRunMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, chevronDown, chevronUp, published } from '@wordpress/icons';
import { useState } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import ConfirmModal from '../../../components/confirm-modal';
import Notice, { NoticeActionButton } from '../../../components/notice';
import { Text } from '../../../components/text';
import { AssistedHandoffLink, MigrationCard, StatusIcon } from './migration-card';
import type {
	Site,
	WordPressMigrationFinding,
	WordPressMigrationSourceConnectionOption,
} from '@automattic/api-core';
import type { ReactNode } from 'react';

const MANUAL_INSTALL = 'manual-wpcom-install';

export function Connect( {
	site,
	sourceHost,
	failure,
}: {
	site: Site;
	sourceHost: string;
	failure?: WordPressMigrationFinding;
} ) {
	const snackbar = { error: __( 'Failed to start the migration.' ) };
	const {
		data: configuration,
		isError,
		refetch,
	} = useQuery( siteWordPressMigrationConfigurationQuery( site.ID ) );
	const connectionOption = configuration?.available_source_connections.find(
		( { method } ) => method === MANUAL_INSTALL
	);
	const [ isShowingFallbacks, setIsShowingFallbacks ] = useState( false );
	const [ hasSeenKey, setHasSeenKey ] = useState( false );
	const [ isConfirming, setIsConfirming ] = useState( false );
	const fallbacksId = useInstanceId( Connect, 'wordpress-migration-fallbacks' );
	const configure = useMutation(
		withSnackbar( siteWordPressMigrationConfigureMutation( site.ID ), snackbar )
	);
	const run = useMutation( withSnackbar( siteWordPressMigrationRunMutation( site.ID ), snackbar ) );
	const isStarting = configure.isPending || run.isPending;
	const isConnected = !! connectionOption?.connected;
	// A source that refused our key has the plugin, and its step has no install button to point to.
	const isOnDestinationOnly =
		!! connectionOption?.installed_on_destination &&
		! isConnected &&
		failure?.code !== 'source_connection_failed';

	const startMigration = () =>
		configure.mutate(
			{ source_connection: { method: MANUAL_INSTALL } },
			{ onSuccess: () => run.mutate( {} ) }
		);

	const onStart = () => {
		// A key copied in by hand doesn't read as connected, so check rather than assume the source can't be reached.
		if ( ! isConnected && ! hasSeenKey ) {
			setIsConfirming( true );
			return;
		}

		startMigration();
	};

	const toggleFallbacks = () => {
		setIsShowingFallbacks( ! isShowingFallbacks );
		setHasSeenKey( true );
	};

	const { title, actions, steps, fallbacks, isKeyInline, connected } = getConnectStep( {
		failure,
		isConnected,
		sourceHost,
		connectionOption,
		isStarting,
		onRun: () => run.mutate( {} ),
		onStart,
	} );

	const keyField = connectionOption && (
		<ClipboardInputControl
			label={ __( 'Migration key' ) }
			value={ connectionOption.key ?? '' }
			readOnly
		/>
	);

	return (
		<MigrationCard
			title={ title }
			decoration={ <StatusIcon status="pending" /> }
			actions={ actions }
			note={ <AssistedHandoffLink siteSlug={ site.slug } /> }
		>
			{ /* What stopped the last run stays until the next one, even once the source reads as connected: it may still refuse. */ }
			{ failure && (
				<Notice
					variant="error"
					title={ sprintf(
						/* translators: %s: what stopped the migration, e.g. "We couldn’t connect to the migration plugin". */
						__( 'The last attempt ran into a problem: %s' ),
						failure.label
					) }
				>
					{ failure.message }
				</Notice>
			) }
			{ /* Only when there's nothing to show: a failed refresh leaves what was last read on screen. */ }
			{ isError && ! connectionOption && (
				<Notice
					variant="error"
					actions={
						<NoticeActionButton variant="minimal" onClick={ () => refetch() }>
							{ __( 'Try again' ) }
						</NoticeActionButton>
					}
				>
					{ __( 'We couldn’t load your site’s details.' ) }
				</Notice>
			) }
			{ isOnDestinationOnly && (
				<Notice
					variant="warning"
					title={ __( 'Install the plugin on the site you’re migrating from' ) }
				>
					{ withDomain(
						/* translators: <domain /> is the domain of the site being migrated, e.g. example.com. */
						__(
							'The Migrate to WordPress.com plugin is active on your WordPress.com site, but it needs to be on <domain />. Click the button below to install it.'
						),
						sourceHost
					) }
				</Notice>
			) }
			{ connected === 'notice' && (
				<Notice variant="success" title={ __( 'Plugin installed and connected' ) }>
					{ __( 'Your site is connected to WordPress.com.' ) }
				</Notice>
			) }
			{ /* Hidden, not removed: swapping it out under Google Translate can crash the page (react/react#11538). */ }
			<VStack
				spacing={ 4 }
				hidden={ connected === 'notice' }
				className="wordpress-migration__connect-help"
			>
				{ connected === 'hint' && (
					<HStack
						spacing={ 1 }
						alignment="flex-start"
						justify="flex-start"
						className="wordpress-migration__connected-hint"
					>
						<Icon icon={ published } size={ 18 } />
						<Text>
							{ __(
								'Your site appears to have the plugin installed and connected to WordPress.com.'
							) }
						</Text>
					</HStack>
				) }
				<VStack
					as="ol"
					spacing={ 1 }
					hidden={ !! connected }
					className="wordpress-migration__connect-help wordpress-migration__list"
				>
					{ steps.map( ( step, index ) => (
						<Text as="li" variant="muted" key={ index }>
							{ step }
						</Text>
					) ) }
				</VStack>
				{ isKeyInline && keyField }
				<VStack spacing={ 4 }>
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						size="compact"
						icon={ isShowingFallbacks ? chevronUp : chevronDown }
						iconPosition="right"
						aria-expanded={ isShowingFallbacks }
						aria-controls={ isShowingFallbacks ? fallbacksId : undefined }
						// Its links and key come with the site's details, so it opens once they've loaded.
						disabled={ ! connectionOption }
						onClick={ toggleFallbacks }
						className="wordpress-migration__fallbacks-toggle"
					>
						{ __( 'Having trouble? Click here for help.' ) }
					</Button>
					{ isShowingFallbacks && connectionOption && (
						<VStack spacing={ 4 } id={ fallbacksId }>
							<VStack as="ul" spacing={ 1 } className="wordpress-migration__list">
								{ fallbacks.map( ( fallback, index ) => (
									<Text as="li" variant="muted" key={ index }>
										{ fallback }
									</Text>
								) ) }
							</VStack>
							{ ! isKeyInline && keyField }
						</VStack>
					) }
				</VStack>
			</VStack>
			<ConfirmModal
				__experimentalHideHeader={ false }
				title={ __( 'Have you connected your site?' ) }
				isDismissible={ false }
				isOpen={ isConfirming }
				cancelButtonText={ __( 'Go back' ) }
				confirmButtonProps={ { label: __( 'Start the migration' ) } }
				onCancel={ () => setIsConfirming( false ) }
				onConfirm={ () => {
					setIsConfirming( false );
					startMigration();
				} }
			>
				{ withDomain(
					/* translators: <domain /> is the domain of the site being migrated, e.g. example.com. */
					__(
						'We haven’t been able to confirm that <domain /> is connected to WordPress.com. Only continue if you have connected the plugin or copied over the migration key manually.'
					),
					sourceHost
				) }
			</ConfirmModal>
		</MigrationCard>
	);
}

/**
 * Everything the connect step shows that depends on the current state/attempt.
 */
function getConnectStep( {
	failure,
	isConnected,
	sourceHost,
	connectionOption,
	isStarting,
	onRun,
	onStart,
}: {
	failure?: WordPressMigrationFinding;
	isConnected: boolean;
	sourceHost: string;
	connectionOption?: WordPressMigrationSourceConnectionOption;
	isStarting: boolean;
	onRun: () => void;
	onStart: () => void;
} ): {
	title: string;
	actions: ReactNode;
	steps: ReactNode[];
	fallbacks: ReactNode[];
	// Whether the key shows with the steps, rather than with the other ways to set this up.
	isKeyInline: boolean;
	// Once the source reads as connected: a notice that says so, or only a hint after a failed run.
	connected?: 'notice' | 'hint';
} {
	const linkButton = ( href: string | undefined, label: string ) => (
		<Button
			__next40pxDefaultSize
			variant="primary"
			href={ href }
			target="_blank"
			disabled={ ! connectionOption }
		>
			{ label }
		</Button>
	);
	// Beside the step's own action, starting comes second, and says what has to be done first.
	const startButton = ( onClick: () => void, label?: string ) => (
		<Button
			__next40pxDefaultSize
			variant={ label ? 'secondary' : 'primary' }
			isBusy={ isStarting }
			disabled={ ! connectionOption || isStarting }
			onClick={ onClick }
		>
			{ label ?? __( 'Start the migration' ) }
		</Button>
	);

	// The plugin answered but refused our key, so go straight to adding it by hand. That works whichever account the
	// plugin is connected to, and whatever kept the key from getting there through Jetpack. Even a source that reads as
	// connected may be connected to another account.
	if ( failure?.code === 'source_connection_failed' ) {
		return {
			title: __( 'Add the migration key' ),
			// Only a run: configuring again would forget what was accepted, like an unverified certificate.
			actions: (
				<>
					{ linkButton( connectionOption?.manual_url, __( 'Open the migration key page ↗' ) ) }
					{ startButton( onRun, __( 'The key is added, start the migration' ) ) }
				</>
			),
			isKeyInline: true,
			steps: [
				withDomain(
					/* translators: <domain /> is the domain of the site being migrated, e.g. example.com. */
					__( 'On <domain />, copy the migration key into the plugin’s settings page.' ),
					sourceHost
				),
				__( 'Come back here and start the migration.' ),
			],
			fallbacks: [
				// The key page link goes to the usual wp-admin address, which some sites move or hide.
				withDomain(
					/* translators: <domain /> is the domain of the site being migrated, e.g. example.com. */
					__(
						'Log in to the WordPress admin dashboard on <domain />, select “Migrate to WordPress.com” in the menu, then select Add Migration Key.'
					),
					sourceHost
				),
				createInterpolateElement(
					__(
						'Don’t see “Migrate to WordPress.com” in the menu? Install the plugin from <link>WordPress.org</link>.'
					),
					{ link: linkTo( connectionOption?.plugin_url ) }
				),
			],
		};
	}

	const install = {
		title: __( 'Install our plugin to start the migration' ),
		actions: (
			<>
				{ linkButton( connectionOption?.install_url, __( 'Install the plugin ↗' ) ) }
				{ startButton( onStart, __( 'The plugin is connected, start the migration' ) ) }
			</>
		),
		isKeyInline: false,
		steps: [
			withDomain(
				/* translators: <domain /> is the domain of the site being migrated, e.g. example.com. */
				__( 'On <domain />, install and activate the Migrate to WordPress.com plugin.' ),
				sourceHost
			),
			__( 'Open the plugin’s settings page and connect to WordPress.com.' ),
			__( 'Come back here and start the migration.' ),
		],
		fallbacks: [
			createInterpolateElement(
				__( 'Unable to find the plugin? Download it from <link>WordPress.org</link>' ),
				{ link: linkTo( connectionOption?.plugin_url ) }
			),
			createInterpolateElement(
				__( 'Already have the plugin? Connect on its <link>settings page</link>' ),
				{ link: linkTo( connectionOption?.connect_url ) }
			),
			createInterpolateElement(
				__(
					'Can’t connect? Copy the migration key onto the plugin’s <link>migration key page</link>'
				),
				{ link: linkTo( connectionOption?.manual_url ) }
			),
		],
	};

	// Connected, the steps are hidden but the ways to set this up stay a click away. After a failed run that's a hint,
	// not a success: the source may still refuse.
	if ( isConnected ) {
		return {
			...install,
			title: sprintf(
				/* translators: %s: the domain of the site being migrated, e.g. example.com. */
				__( 'Ready to migrate %s' ),
				sourceHost
			),
			actions: startButton( onStart ),
			connected: failure ? 'hint' : 'notice',
		};
	}

	return install;
}

// The source's domain, set apart from the words around it so it reads as the address it is.
function withDomain( text: string, sourceHost: string ) {
	return createInterpolateElement( text, {
		domain: <code className="wordpress-migration__domain">{ sourceHost }</code>,
	} );
}

function linkTo( url?: string ) {
	// @ts-expect-error children prop is injected by createInterpolateElement
	return <ExternalLink href={ url ?? '' } />;
}
