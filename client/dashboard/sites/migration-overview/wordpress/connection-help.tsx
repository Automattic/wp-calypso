import { siteWordPressMigrationConfigurationQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, chevronDown, chevronUp, info } from '@wordpress/icons';
import { useState } from 'react';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import { Text } from '../../../components/text';
import type { Site, WordPressMigrationSourceConnectionOption } from '@automattic/api-core';

export const MANUAL_INSTALL = 'manual-wpcom-install';

// Temporary, can remove at/after launch.
const IS_TESTING_BUILD = [
	'dashboard-stage',
	'dashboard-horizon',
	'dashboard-development',
	'development',
].includes( config( 'env_id' ) );
const TESTING_HINT =
	'Note: The plugin will default to the BlogVault screen. Use the <link>new screen</link>.';

export function useManualInstall( site: Site ) {
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

/**
 * How to install and connect the plugin on the source, and the other ways to connect it.
 */
export function ConnectionHelp( {
	manualInstall,
	lastStep,
	onOpenFallbacks,
}: {
	manualInstall?: WordPressMigrationSourceConnectionOption;
	// What to do back here once the source is connected.
	lastStep: string;
	onOpenFallbacks?: () => void;
} ) {
	return (
		<VStack spacing={ 4 }>
			<VStack spacing={ 1 }>
				<Text variant="muted">
					{ createInterpolateElement(
						__(
							'1. <link>Install</link> and activate the Migrate to WordPress.com plugin on your existing site.'
						),
						{ link: linkTo( manualInstall?.install_url ) }
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
				<Text variant="muted">{ lastStep }</Text>
			</VStack>
			<Fallbacks manualInstall={ manualInstall } onOpen={ onOpenFallbacks } />
		</VStack>
	);
}

/**
 * The other ways to connect the source, the migration key among them, for anyone the plugin's own connection fails.
 */
function Fallbacks( {
	manualInstall,
	onOpen,
}: {
	manualInstall?: WordPressMigrationSourceConnectionOption;
	onOpen?: () => void;
} ) {
	const [ isShowingFallbacks, setIsShowingFallbacks ] = useState( false );
	const fallbacksId = useInstanceId( Fallbacks, 'wordpress-migration-fallbacks' );

	const toggle = () => {
		setIsShowingFallbacks( ! isShowingFallbacks );
		onOpen?.();
	};

	return (
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
				onClick={ toggle }
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
	);
}
