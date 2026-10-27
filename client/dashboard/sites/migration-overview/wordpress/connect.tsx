import {
	siteWordPressMigrationConfigurationQuery,
	siteWordPressMigrationConfigureMutation,
	siteWordPressMigrationRunMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, ExternalLink } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useState } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import ClipboardInputControl from '../../../components/clipboard-input-control';
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

export function Connect( { site, failure }: { site: Site; failure?: WordPressMigrationFinding } ) {
	const snackbar = { error: __( 'Failed to start the migration.' ) };
	const { manualInstall, isError, refetch } = useManualInstall( site );
	const [ isShowingFallbacks, setIsShowingFallbacks ] = useState( false );
	const fallbacksId = useInstanceId( Connect, 'wordpress-migration-fallbacks' );
	const configure = useMutation(
		withSnackbar( siteWordPressMigrationConfigureMutation( site.ID ), snackbar )
	);
	const run = useMutation( withSnackbar( siteWordPressMigrationRunMutation( site.ID ), snackbar ) );
	const isStarting = configure.isPending || run.isPending;

	const startMigration = () =>
		configure.mutate(
			{ source_connection: { method: MANUAL_INSTALL } },
			{ onSuccess: () => run.mutate( {} ) }
		);

	return (
		<MigrationCard
			title={ __( 'Install our plugin to start the migration' ) }
			decoration={ <StatusIcon status="pending" /> }
			actions={
				<>
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={ manualInstall?.install_url }
						target="_blank"
						disabled={ ! manualInstall }
					>
						{ __( 'Install the plugin ↗' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						isBusy={ isStarting }
						disabled={ ! manualInstall || isStarting }
						onClick={ startMigration }
					>
						{ __( 'Start the migration' ) }
					</Button>
				</>
			}
			footer={ <AssistedHandoffLink /> }
		>
			{ failure && (
				<Notice variant="error" title={ failure.label }>
					{ failure.message }
				</Notice>
			) }
			{ isError && (
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
			<VStack spacing={ 1 }>
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
					onClick={ () => setIsShowingFallbacks( ! isShowingFallbacks ) }
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
		</MigrationCard>
	);
}
