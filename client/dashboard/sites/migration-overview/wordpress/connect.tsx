import {
	siteWordPressMigrationConfigurationQuery,
	siteWordPressMigrationConfigureMutation,
	siteWordPressMigrationRunMutation,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
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
import { Icon, chevronDown, chevronUp, info } from '@wordpress/icons';
import { useState } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import ConfirmModal from '../../../components/confirm-modal';
import Notice from '../../../components/notice';
import { Text } from '../../../components/text';
import { AssistedHandoffLink, MigrationCard, StatusIcon } from './migration-card';
import type { Site, WordPressMigrationFinding } from '@automattic/api-core';

const MANUAL_INSTALL = 'manual-wpcom-install';

// Temporary, can remove at/after launch.
const IS_TESTING_BUILD = [
	'dashboard-stage',
	'dashboard-horizon',
	'dashboard-development',
	'development',
].includes( config( 'env_id' ) );
const TESTING_HINT =
	'Note: The plugin will default to the BlogVault screen. Use the <link>new screen</link>.';

function useManualInstall( site: Site ) {
	const {
		data: configuration,
		isError,
		refetch,
	} = useQuery( siteWordPressMigrationConfigurationQuery( site.ID ) );
	const manualInstall = configuration?.available_source_connections.find(
		( { method } ) => method === MANUAL_INSTALL
	);
	return { manualInstall, isError, refetch };
}

function linkTo( url?: string ) {
	// @ts-expect-error children prop is injected by createInterpolateElement
	return <ExternalLink href={ url ?? '' } />;
}

export function Connect( {
	site,
	sourceHost,
	sourceConnected,
	failure,
	retryFindings,
	onRetry,
}: {
	site: Site;
	sourceHost: string;
	// Read with the migration, so it's more up to date than the configuration's.
	sourceConnected?: boolean;
	failure?: WordPressMigrationFinding;
	// Set once the source is connected after refusing: running again, accepting these, should get further.
	retryFindings?: string[];
	onRetry: () => void;
} ) {
	const snackbar = { error: __( 'Failed to start the migration.' ) };
	const { manualInstall, isError, refetch } = useManualInstall( site );
	const [ isShowingFallbacks, setIsShowingFallbacks ] = useState( false );
	const [ hasSeenKey, setHasSeenKey ] = useState( false );
	const [ isConfirming, setIsConfirming ] = useState( false );
	const fallbacksId = useInstanceId( Connect, 'wordpress-migration-fallbacks' );
	const configure = useMutation(
		withSnackbar( siteWordPressMigrationConfigureMutation( site.ID ), snackbar )
	);
	const run = useMutation( withSnackbar( siteWordPressMigrationRunMutation( site.ID ), snackbar ) );
	const isStarting = configure.isPending || run.isPending;
	const isSourceConnected = !! ( sourceConnected ?? manualInstall?.connected );
	const isRetry = !! retryFindings;
	const isConnected = failure ? isRetry : isSourceConnected;

	const startMigration = () => {
		if ( retryFindings ) {
			run.mutate( { accept_findings: retryFindings }, { onSuccess: onRetry } );
			return;
		}
		configure.mutate(
			{ source_connection: { method: MANUAL_INSTALL } },
			{ onSuccess: () => run.mutate( {} ) }
		);
	};

	// A run can't reach a source that isn't connected, so check before starting one that will only be refused.
	const onStart = () => {
		if ( ! isSourceConnected && ! hasSeenKey ) {
			setIsConfirming( true );
			return;
		}
		startMigration();
	};

	const toggleFallbacks = () => {
		setIsShowingFallbacks( ! isShowingFallbacks );
		setHasSeenKey( true );
	};

	return (
		<MigrationCard
			title={
				isConnected
					? sprintf(
							/* translators: %s: the domain of the site being migrated, e.g. example.com. */
							__( 'Ready to migrate %s' ),
							sourceHost
						)
					: __( 'Install our plugin to start the migration' )
			}
			decoration={ <StatusIcon status="pending" /> }
			actions={
				<>
					{ ! isConnected && (
						<Button
							__next40pxDefaultSize
							variant="primary"
							href={ manualInstall?.install_url }
							target="_blank"
							disabled={ ! manualInstall }
						>
							{ __( 'Install the plugin ↗' ) }
						</Button>
					) }
					<Button
						__next40pxDefaultSize
						variant={ isConnected ? 'primary' : 'secondary' }
						isBusy={ isStarting }
						disabled={ ! manualInstall || isStarting }
						onClick={ onStart }
					>
						{ isRetry ? __( 'Try again' ) : __( 'Start the migration' ) }
					</Button>
				</>
			}
			secondaryAction={ <AssistedHandoffLink /> }
		>
			{ failure && ! isConnected && (
				<Notice variant="error" title={ failure.label }>
					{ failure.message }
				</Notice>
			) }
			{ isError && (
				<Notice
					variant="error"
					actions={
						<Button variant="link" onClick={ () => refetch() }>
							{ __( 'Try again' ) }
						</Button>
					}
				>
					{ __( 'We couldn’t load your site’s details.' ) }
				</Notice>
			) }
			{ isConnected && (
				<Notice
					variant="success"
					title={
						isRetry ? __( 'Plugin connected — try again' ) : __( 'Plugin installed and connected' )
					}
				>
					{ isRetry
						? __( 'Your site is now connected to WordPress.com. Try the migration again.' )
						: __(
								'Your site is connected to WordPress.com. Start the migration whenever you’re ready.'
							) }
				</Notice>
			) }
			<VStack spacing={ 4 }>
				{ /* Hidden, not removed: swapping it out under Google Translate can crash the page (react/react#11538). */ }
				<VStack spacing={ 1 } hidden={ isConnected } className="wordpress-migration__connect-help">
					<Text variant="muted">
						{ __(
							'1. Install and activate the Migrate to WordPress.com plugin on your existing site.'
						) }
					</Text>
					<Text variant="muted">
						{ __( '2. Connect to WordPress.com on the plugin’s settings page.' ) }
					</Text>
					{ IS_TESTING_BUILD && (
						<HStack
							spacing={ 1 }
							alignment="flex-start"
							justify="flex-start"
							className="wordpress-migration__testing-hint"
						>
							<Icon icon={ info } size={ 18 } />
							<Text variant="muted">
								{ createInterpolateElement( TESTING_HINT, {
									link: linkTo( manualInstall?.connect_url ),
								} ) }
							</Text>
						</HStack>
					) }
					<Text variant="muted">{ __( '3. Come back here and start the migration.' ) }</Text>
				</VStack>
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
						disabled={ ! manualInstall }
						onClick={ toggleFallbacks }
						className="wordpress-migration__fallbacks-toggle"
					>
						{ __( 'Having trouble? See other ways to set this up.' ) }
					</Button>
					{ isShowingFallbacks && manualInstall && (
						<VStack spacing={ 4 } id={ fallbacksId }>
							<VStack as="ul" spacing={ 1 } className="wordpress-migration__fallbacks">
								<Text as="li" variant="muted">
									{ createInterpolateElement(
										__( 'Unable to find the plugin? Download it from <link>WordPress.org</link>' ),
										{ link: linkTo( manualInstall.plugin_url ) }
									) }
								</Text>
								<Text as="li" variant="muted">
									{ createInterpolateElement(
										__( 'Already have the plugin? Connect on its <link>settings page</link>' ),
										{ link: linkTo( manualInstall.connect_url ) }
									) }
								</Text>
								<Text as="li" variant="muted">
									{ createInterpolateElement(
										__(
											'Can’t connect? Copy the migration key onto the plugin’s <link>migration key page</link>'
										),
										{ link: linkTo( manualInstall.manual_url ) }
									) }
								</Text>
							</VStack>
							<ClipboardInputControl
								label={ __( 'Migration key' ) }
								value={ manualInstall.key ?? '' }
								readOnly
							/>
						</VStack>
					) }
				</VStack>
			</VStack>
			<ConfirmModal
				isOpen={ isConfirming }
				cancelButtonText={ __( 'Go back' ) }
				confirmButtonProps={ { label: __( 'Start anyway' ) } }
				onCancel={ () => setIsConfirming( false ) }
				onConfirm={ () => {
					setIsConfirming( false );
					startMigration();
				} }
			>
				{ __(
					'Start the migration anyway? Your site isn’t connected to WordPress.com yet, so the migration is unlikely to work. If you’re having trouble connecting the plugin, copy the migration key from “Having trouble?” onto the plugin’s migration key page instead.'
				) }
			</ConfirmModal>
		</MigrationCard>
	);
}
