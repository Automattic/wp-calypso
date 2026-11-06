import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	__experimentalItemGroup as ItemGroup,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chevronDown, copySmall, download } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import A4ALogo from '../add-new-site/a4a-logo';
import { getA4APluginInstallUrl, getJetpackConnectUrl } from '../add-new-site/lib';
import { SiteListSummary, SiteSummary } from './site-list-input';
import SitePreview from './site-preview';
import { SupportHelp } from './step-details';
import { Disclosure, NumberedSteps, Section } from './step-kit';
import type { IntakeSite } from './site-intake';
import type { Site } from '@automattic/api-core';
import type { ReactNode } from 'react';

const A4A_PLUGIN_SLUG = 'automattic-for-agencies-client';
const A4A_INSTALL_COMMAND = `wp plugin install ${ A4A_PLUGIN_SLUG } --activate`;

type Plugin = 'a4a' | 'jetpack';

function getPlugins() {
	return {
		a4a: {
			slug: A4A_PLUGIN_SLUG,
			name: __( 'Automattic for Agencies' ),
			shortName: __( 'A4A' ),
			logo: <A4ALogo size={ 32 } />,
			summary: __( 'Connects the site only' ),
			description: __( 'Connects the site to this dashboard, and nothing else.' ),
			installUrl: getA4APluginInstallUrl,
		},
		jetpack: {
			slug: 'jetpack',
			name: __( 'Jetpack' ),
			shortName: __( 'Jetpack' ),
			logo: <JetpackLogo size={ 32 } />,
			summary: __( 'Adds security, backups, and more' ),
			description: __( 'Connects the site and adds security, backups, and performance tools.' ),
			installUrl: getJetpackConnectUrl,
		},
	};
}

/** The latest version on WordPress.org, so the download names the file you'll get. */
function usePluginVersion( slug: string ) {
	return useQuery( {
		queryKey: [ 'wporg-plugin-version', slug ],
		queryFn: async () => {
			const response = await fetch(
				`https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${ slug }&request[fields][sections]=0`
			);
			const info = ( await response.json() ) as { version?: string };
			return info.version ?? null;
		},
		staleTime: 60 * 60 * 1000,
		retry: false,
	} ).data;
}

function PluginCard( { plugin }: { plugin: ReturnType< typeof getPlugins >[ Plugin ] } ) {
	const version = usePluginVersion( plugin.slug );
	const file = version ? `${ plugin.slug }.${ version }.zip` : `${ plugin.slug }.zip`;
	return (
		<VStack spacing={ 4 } className="agency-site-wizard__plugin-card">
			<span className="agency-site-wizard__plugin-mark" aria-hidden="true">
				{ plugin.logo }
			</span>
			<VStack spacing={ 1 }>
				<Heading level={ 4 } size={ 15 } weight={ 500 }>
					{ plugin.name }
				</Heading>
				<Text variant="muted">{ plugin.description }</Text>
			</VStack>
			<HStack spacing={ 3 } justify="flex-start" className="agency-site-wizard__plugin-download">
				<Button
					variant="secondary"
					size="compact"
					icon={ download }
					href={ `https://downloads.wordpress.org/plugin/${ file }` }
					__next40pxDefaultSize
				>
					{ sprintf(
						/* translators: %s is a short plugin name, e.g. "Jetpack". */
						__( 'Download %s' ),
						plugin.shortName
					) }
				</Button>
				{ version && (
					<Text variant="muted">
						{ sprintf(
							/* translators: %s is a version number, e.g. "15.2". */
							__( 'v%s' ),
							version
						) }
					</Text>
				) }
			</HStack>
		</VStack>
	);
}

interface ConnectionSitesProps {
	sites: IntakeSite[];
	knownSite?: Site;
	simulate: boolean;
}

export function ConnectionSites( { sites, knownSite, simulate }: ConnectionSitesProps ) {
	return (
		<div className="agency-site-wizard__connection-sites">
			<SitePreview site={ sites[ 0 ] } knownSite={ knownSite } simulate={ simulate } size="large" />
		</div>
	);
}

/** Lets each site use either plugin, so a batch can mix sites with and without Jetpack. */
export function PluginInstallMenu( { site }: { site: IntakeSite } ) {
	const plugins = getPlugins();
	return (
		<DropdownMenu
			icon={ chevronDown }
			text={ __( 'Install plugin' ) }
			label={ sprintf(
				/* translators: %s is the website name. */
				__( 'Install a plugin on %s' ),
				site.name
			) }
			toggleProps={ {
				variant: 'tertiary',
				iconPosition: 'right',
				showTooltip: false,
				__next40pxDefaultSize: true,
			} }
			popoverProps={ { placement: 'bottom-end' } }
		>
			{ ( { onClose } ) => (
				<MenuGroup>
					{ ( Object.keys( plugins ) as Plugin[] ).map( ( key ) => (
						<MenuItem
							key={ key }
							info={ plugins[ key ].summary }
							onClick={ () => {
								const url = plugins[ key ].installUrl( site.url );
								if ( url ) {
									window.open( url, '_blank', 'noopener' );
								}
								onClose();
							} }
						>
							{ plugins[ key ].name }
						</MenuItem>
					) ) }
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}

/**
 * Sites waiting for a plugin. With installers, each site needs its own menu,
 * so they're listed; otherwise a summary is enough.
 */
export function ConnectionSiteList( {
	sites,
	simulate,
	showInstallers,
	heading,
	describe,
	renderAction,
}: ConnectionSitesProps & {
	showInstallers?: boolean;
	heading?: string;
	describe?: ( site: IntakeSite ) => string | undefined;
	renderAction?: ( site: IntakeSite ) => ReactNode;
} ) {
	const title =
		heading ??
		sprintf(
			/* translators: %d is the number of sites. */
			_n( '%d site to connect', '%d sites to connect', sites.length ),
			sites.length
		);
	if ( ! showInstallers ) {
		return <SiteSummary sites={ sites } heading={ title } />;
	}
	return (
		<SiteListSummary
			sites={ sites }
			simulate={ simulate }
			heading={ title }
			describe={ describe }
			renderAction={ renderAction ?? ( ( site ) => <PluginInstallMenu site={ site } /> ) }
		/>
	);
}

function CopyButton( { text, label }: { text: string; label: string } ) {
	const [ copied, setCopied ] = useState( false );
	useEffect( () => {
		if ( ! copied ) {
			return;
		}
		const timer = window.setTimeout( () => setCopied( false ), 4000 );
		return () => window.clearTimeout( timer );
	}, [ copied ] );
	return (
		<Button
			variant="secondary"
			size="compact"
			icon={ copySmall }
			onClick={ () => {
				void navigator.clipboard.writeText( text );
				setCopied( true );
			} }
			__next40pxDefaultSize
		>
			{ copied ? __( 'Copied' ) : label }
		</Button>
	);
}

/** Ways to install across a batch without opening each site's admin. */
function BulkInstall( { sites }: { sites: IntakeSite[] } ) {
	const prompt = [
		sprintf(
			/* translators: %s is a WP-CLI command. */
			__(
				'Install and activate the Automattic for Agencies plugin on each of these WordPress sites. Connect to each site over SSH and run `%s`. Skip any site where the plugin or Jetpack is already active, and don’t change anything else. When you’re done, tell me which sites worked and which didn’t, with the error.'
			),
			A4A_INSTALL_COMMAND
		),
		'',
		...sites.map( ( site ) => site.url ),
	].join( '\n' );
	const options = [
		{
			title: __( 'Ask your AI agent' ),
			description: __( 'A prompt listing every site, for an agent with SSH access.' ),
			copy: <CopyButton text={ prompt } label={ __( 'Copy prompt' ) } />,
		},
		{
			title: __( 'Use WP-CLI' ),
			description: __( 'The install command, to run on each site over SSH.' ),
			copy: <CopyButton text={ A4A_INSTALL_COMMAND } label={ __( 'Copy command' ) } />,
		},
	];
	return (
		<Disclosure title={ __( 'Install on many sites at once' ) }>
			<VStack spacing={ 3 }>
				<Text variant="muted">
					{ __(
						'For sites you reach over SSH. Both install Automattic for Agencies. You’ll still approve each connection.'
					) }
				</Text>
				<ItemGroup isBordered isSeparated className="agency-site-wizard__site-list-items">
					{ options.map( ( option ) => (
						<Item key={ option.title }>
							<HStack spacing={ 4 }>
								<VStack spacing={ 0 } className="agency-site-wizard__plugin-text">
									<Text weight={ 500 }>{ option.title }</Text>
									<Text variant="muted">{ option.description }</Text>
								</VStack>
								{ option.copy }
							</HStack>
						</Item>
					) ) }
				</ItemGroup>
			</VStack>
		</Disclosure>
	);
}

/** Everything needed to install either plugin: both options, each site's installer, and bulk tools. */
export function ConnectionInstall( {
	sites,
	simulate,
}: {
	sites: IntakeSite[];
	simulate: boolean;
} ) {
	const plugins = getPlugins();
	return (
		<VStack spacing={ 8 }>
			<Section
				title={ __( 'Pick a plugin' ) }
				description={
					sites.length > 1
						? __( 'Each site can use either one. Already using Jetpack? Use that.' )
						: __( 'Already using Jetpack? Use that.' )
				}
			>
				<div className="agency-site-wizard__plugin-grid">
					<PluginCard plugin={ plugins.a4a } />
					<PluginCard plugin={ plugins.jetpack } />
				</div>
			</Section>
			<ConnectionSiteList sites={ sites } simulate={ simulate } showInstallers />
			{ sites.length > 1 && <BulkInstall sites={ sites } /> }
		</VStack>
	);
}

/** What to check when a connection fails, and how to reach a person. */
export function ConnectionTroubleshooting( { sites }: { sites: IntakeSite[] } ) {
	return (
		<VStack spacing={ 8 }>
			<Section title={ __( 'What to check' ) }>
				<NumberedSteps
					items={ [
						{
							title: __( 'The plugin is active' ),
							description: __( 'In WordPress, check Plugins → Installed Plugins.' ),
						},
						{
							title: __( 'You approved the connection' ),
							description: __(
								'Open the plugin, choose “Connect this site,” and sign in with your agency’s WordPress.com account.'
							),
						},
						{
							title: __( 'Nothing blocks WordPress.com' ),
							description: __(
								'Security plugins and firewalls can block the connection. Allow requests from WordPress.com.'
							),
						},
						{
							title: __( 'The site is public' ),
							description: __(
								'Sites in maintenance mode, behind a password, or on a local address can’t connect.'
							),
						},
					] }
				/>
			</Section>
			<SupportHelp
				title={ __( 'Still stuck?' ) }
				description={ __( 'Chat with our support team. We’ll look at these sites with you.' ) }
				chatMessage={ sprintf(
					/* translators: %s is a list of website addresses. */
					__( 'I’m having trouble connecting these sites to my agency dashboard: %s' ),
					sites.map( ( site ) => site.url ).join( ', ' )
				) }
			/>
		</VStack>
	);
}
