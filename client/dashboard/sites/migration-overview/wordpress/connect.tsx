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
import type { Site, WordPressMigrationFinding } from '@automattic/api-core';

const MANUAL_INSTALL = 'manual-wpcom-install';

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
	failure,
}: {
	site: Site;
	sourceHost: string;
	failure?: WordPressMigrationFinding;
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
	const isConnected = !! manualInstall?.connected;

	const startMigration = () =>
		configure.mutate(
			{ source_connection: { method: MANUAL_INSTALL } },
			{ onSuccess: () => run.mutate( {} ) }
		);

	// A key copied in by hand doesn't read as connected, so check rather than assume the source can't be reached.
	const onStart = () => {
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
						{ __( 'Start the migration' ) }
					</Button>
				</>
			}
			note={ <AssistedHandoffLink siteSlug={ site.slug } /> }
		>
			{ /* What stopped the last run stays until the next one, even once the source reads as connected: it may still refuse. */ }
			{ failure && (
				<Notice
					variant="error"
					title={ sprintf(
						/* translators: %s: what stopped the migration, e.g. "Your site refused the connection". */
						__( 'The last attempt ran into a problem: %s' ),
						failure.label
					) }
				>
					{ failure.message }
				</Notice>
			) }
			{ /* Only when there's nothing to show: a failed refresh leaves what was last read on screen. */ }
			{ isError && ! manualInstall && (
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
			{ isConnected && ! failure && (
				<Notice variant="success" title={ __( 'Plugin installed and connected' ) }>
					{ __( 'Your site is connected to WordPress.com.' ) }
				</Notice>
			) }
			{ /* Hidden, not removed: swapping it out under Google Translate can crash the page (react/react#11538). */ }
			<VStack
				spacing={ 4 }
				hidden={ isConnected && ! failure }
				className="wordpress-migration__connect-help"
			>
				{ isConnected && (
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
				<VStack spacing={ 1 } hidden={ isConnected } className="wordpress-migration__connect-help">
					<Text variant="muted">
						{ __(
							'1. Install and activate the Migrate to WordPress.com plugin on your existing site.'
						) }
					</Text>
					<Text variant="muted">
						{ __( '2. Connect to WordPress.com on the plugin’s settings page.' ) }
					</Text>
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
				{ __(
					'We haven’t been able to confirm that your site is connected to WordPress.com. Only continue if you have connected the plugin or copied over the migration key manually.'
				) }
			</ConfirmModal>
		</MigrationCard>
	);
}
