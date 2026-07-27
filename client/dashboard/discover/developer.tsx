import { localizeUrl } from '@automattic/i18n-utils';
import { Badge } from '@automattic/ui';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import PageLayout from '../components/page-layout';
import { Text } from '../components/text';
import { wpcomLink } from '../utils/link';
import { HelpStrip, SectionTitle, useDiscoverTracks, VideoTutorials } from './shared';
import type { HelpLink, VideoTutorial } from './shared';

interface DevAiPath {
	slug: string;
	name: string;
	badge?: string;
	hint: string;
	description: string;
	cta: { label: string; href: string };
}

interface DevPipelineStep {
	title: string;
	description: string;
}

type DevAiVersion = 'cards' | 'list';

const DEV_AI_VERSIONS: DevAiVersion[] = [ 'cards', 'list' ];

const DEV_AI_VERSION_STORAGE_KEY = 'discover-dev-ai-version';

const getDevAiPaths = (): DevAiPath[] => [
	{
		slug: 'studio_code',
		name: 'Studio Code',
		badge: __( 'Beta' ),
		hint: '$ studio code',
		description: __(
			'An AI agent that knows WordPress, not just code. Describe what you want in the terminal and it builds the block theme, content, and plugins — checking its own work with a screenshot loop.'
		),
		cta: {
			label: __( 'Meet Studio Code' ),
			href: 'https://developer.wordpress.com/docs/developer-tools/studio/studio-code/',
		},
	},
	{
		slug: 'mcp',
		name: __( 'MCP Server' ),
		badge: __( 'All paid plans' ),
		hint: 'claude · cursor · vs code · codex',
		description: __(
			'Bring the agent you already use. Connect it to your live site with 80+ abilities — design-aware, scoped per site, and every write needs your explicit confirmation.'
		),
		cta: { label: __( 'Connect an agent' ), href: wpcomLink( '/me/mcp' ) },
	},
	{
		slug: 'telex',
		name: 'Telex',
		badge: __( 'Experimental' ),
		hint: 'prompt → installable .zip',
		description: __(
			'Turn plain-English descriptions into production-ready blocks and themes. No React, no PHP, no build tools — it runs entirely in your browser.'
		),
		cta: { label: __( 'Try Telex' ), href: 'https://telex.automattic.ai' },
	},
	{
		slug: 'studio_assistant',
		name: 'Studio Assistant',
		badge: __( 'In Studio' ),
		hint: 'chat · wp-cli · in the app',
		description: __(
			'AI chat built into the Studio desktop app. Ask questions and it runs WP-CLI for you — help without leaving your local site.'
		),
		cta: { label: __( 'Explore Studio' ), href: 'https://developer.wordpress.com/studio/' },
	},
];

// Curated from the latest uploads on youtube.com/@wordpressdotcom, developer
// and agency topics only. Titles are the actual YouTube video titles, so they
// stay untranslated.
const DEV_VIDEOS: VideoTutorial[] = [
	{ id: '5B-5Z3A8YA8', title: 'My New Favourite Way to Vibe Code WordPress' },
	{
		id: '0NCfK6M33kY',
		title:
			'Media Editor Modal, React 19, Client-Side Media & PHP 8.5: WordPress for Developers — June 2026',
	},
	{ id: 'KDLqEd_QAD8', title: 'Connect Claude to your WordPress.com site' },
	{ id: 'GRJYGLTpQLQ', title: 'WordPress Studio + MCP: A Better AI Workflow' },
	{ id: 'Jywvzfo_w8c', title: 'You can now Vibe Code with WordPress.com' },
];

const getDevPipelineSteps = (): DevPipelineStep[] => [
	{
		title: __( 'Build locally' ),
		description: __(
			'Studio spins up WordPress in seconds — no Docker, no MySQL. Switch WordPress and PHP versions to catch compatibility issues early.'
		),
	},
	{
		title: __( 'Share a preview' ),
		description: __(
			'Cloud-hosted preview sites your clients can open anytime — even while your laptop sleeps.'
		),
	},
	{
		title: __( 'Push to deploy' ),
		description: __(
			'Connect a GitHub repo and every push ships automatically to staging or production. No FTP, no manual uploads.'
		),
	},
	{
		title: __( 'Test, then ship' ),
		description: __(
			'Clone production with one click, verify the risky changes on staging, and sync back when everything is green.'
		),
	},
];

const getDeveloperHelpLinks = (): HelpLink[] => [
	{ label: __( 'Developer docs' ), href: 'https://developer.wordpress.com/docs/' },
	{
		label: __( 'MCP tools reference' ),
		href: 'https://developer.wordpress.com/docs/mcp/tools-reference/',
	},
	{ label: __( 'Developer Blog' ), href: 'https://developer.wordpress.com/blog/' },
	{ label: __( 'Contact us' ), href: wpcomLink( '/help' ) },
];

function DevHero() {
	const trackClick = useDiscoverTracks( 'developers' );

	return (
		<section className="discover-dev-hero">
			<div className="discover-dev-hero-inner">
				<VStack spacing={ 5 } alignment="flex-start" className="discover-dev-hero-copy">
					<Text className="discover-hero-eyebrow" as="p">
						{ __( 'For developers & agencies' ) }
					</Text>
					<Heading level={ 1 } className="discover-hero-title">
						{ __( 'Your workflow, your tools' ) }
					</Heading>
					<Text className="discover-hero-subtitle" as="p">
						{ __(
							'Real WordPress with developer control — SSH, WP-CLI, Git deployments, and staging. You build and ship; we handle speed, security, updates, and backups.'
						) }
					</Text>
					<HStack spacing={ 3 } justify="flex-start" expanded={ false } wrap>
						<Button
							variant="primary"
							href="https://developer.wordpress.com/studio/"
							target="_blank"
							rel="noopener noreferrer"
							__next40pxDefaultSize
							onClick={ () => trackClick( 'hero_primary' ) }
						>
							{ __( 'Download Studio — free' ) }
						</Button>
						<Button
							variant="secondary"
							className="discover-dev-hero-secondary"
							href="https://developer.wordpress.com/docs/"
							target="_blank"
							rel="noopener noreferrer"
							__next40pxDefaultSize
							onClick={ () => trackClick( 'hero_secondary' ) }
						>
							{ __( 'Read the docs' ) }
						</Button>
					</HStack>
					<Text className="discover-hero-footnote" as="p">
						{ __(
							'Studio is free and open source. WordPress powers over 40% of the web — you power WordPress.'
						) }
					</Text>
				</VStack>
				<div className="discover-dev-terminal" aria-hidden="true">
					<div className="discover-dev-terminal-bar">
						<span />
						<span />
						<span />
						<code>studio — zsh</code>
					</div>
					<pre>
						<span className="is-cmd">~/clients $ studio create acme-relaunch</span>
						<span className="is-ok">✔ Local WordPress ready in 3s — no Docker, no MySQL</span>
						<span className="is-cmd">~/clients/acme-relaunch $ studio code</span>
						<span className="is-agent">agent · What are we building today?</span>
						<span className="is-cmd">
							&gt; Rebuild acme.com as a block theme, then push it to staging
							<span className="discover-dev-caret" />
						</span>
					</pre>
				</div>
			</div>
		</section>
	);
}

// Decorative CSS-only product mocks for the AI cards; content is illustrative,
// so it stays untranslated and hidden from assistive tech.
function DevAiVisual( { slug }: { slug: string } ) {
	switch ( slug ) {
		case 'studio_code':
			return (
				<div className="discover-dev-visual-terminal">
					<span className="is-cmd">$ studio code</span>
					<span className="is-ok">✔ Block theme scaffolded</span>
					<span className="is-ok">✔ Screenshot check passed</span>
					<span className="is-cmd">
						&gt; Add a pricing page
						<span className="discover-dev-caret" />
					</span>
				</div>
			);
		case 'mcp':
			return (
				<div className="discover-dev-visual-abilities">
					{ [ 'posts.create', 'media.upload', 'themes.design_tokens', 'stats.read' ].map(
						( ability ) => (
							<span key={ ability }>
								<i />
								{ ability }
							</span>
						)
					) }
				</div>
			);
		case 'telex':
			return (
				<div className="discover-dev-visual-telex">
					<span className="discover-dev-visual-prompt">“A pricing table with three tiers”</span>
					<span className="discover-dev-visual-arrow">↓</span>
					<span className="discover-dev-visual-block">
						<i />
						<i />
						<i />
					</span>
				</div>
			);
		case 'studio_assistant':
			return (
				<div className="discover-dev-visual-chat">
					<span className="is-user">Why is my homepage slow?</span>
					<span className="is-bot">Let me profile it for you…</span>
					<span className="is-bot is-code">$ wp profile stage --fields=stage,time</span>
				</div>
			);
		default:
			return null;
	}
}

function DevAiPaths() {
	const trackClick = useDiscoverTracks( 'developers' );
	const [ version, setVersion ] = useState< DevAiVersion >( () => {
		if ( typeof window === 'undefined' ) {
			return 'cards';
		}
		const stored = window.localStorage.getItem( DEV_AI_VERSION_STORAGE_KEY ) as DevAiVersion;
		return DEV_AI_VERSIONS.includes( stored ) ? stored : 'cards';
	} );

	const switchVersion = ( next: DevAiVersion ) => {
		setVersion( next );
		window.localStorage.setItem( DEV_AI_VERSION_STORAGE_KEY, next );
	};

	return (
		<VStack spacing={ 4 }>
			<SectionTitle
				title={ __( 'Build with AI, your way' ) }
				action={
					<div className="discover-mini-switch">
						{ DEV_AI_VERSIONS.map( ( value, index ) => (
							<button
								key={ value }
								type="button"
								aria-pressed={ version === value }
								onClick={ () => switchVersion( value ) }
							>
								{ `V${ index + 1 }` }
							</button>
						) ) }
					</div>
				}
			/>
			<Text as="p" className="discover-section-subheading">
				{ __(
					'General coding agents know code — these know WordPress. Pick the path that fits your workflow, or mix them.'
				) }
			</Text>
			{ version === 'cards' ? (
				<div className="discover-dev-ai-grid">
					{ getDevAiPaths().map( ( path ) => (
						<div key={ path.slug } className="discover-dev-ai-card">
							<div className="discover-dev-ai-card-content">
								<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
									<Heading level={ 3 } className="discover-dev-ai-card-title">
										{ path.name }
									</Heading>
									{ path.badge && <Badge>{ path.badge }</Badge> }
								</HStack>
								<Text as="p" className="discover-dev-ai-card-description">
									{ path.description }
								</Text>
								<code className="discover-dev-ledger-hint">{ path.hint }</code>
								<div className="discover-dev-ai-card-action">
									<Button
										variant="secondary"
										href={ path.cta.href }
										target="_blank"
										rel="noopener noreferrer"
										__next40pxDefaultSize
										onClick={ () => trackClick( `ai_${ path.slug }` ) }
									>
										{ path.cta.label }
									</Button>
								</div>
							</div>
							<div className="discover-dev-ai-card-visual" aria-hidden="true">
								<DevAiVisual slug={ path.slug } />
							</div>
						</div>
					) ) }
				</div>
			) : (
				<div className="discover-dev-ledger">
					{ getDevAiPaths().map( ( path ) => (
						<div key={ path.slug } className="discover-dev-ledger-row">
							<div className="discover-dev-ledger-body">
								<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
									<Heading level={ 3 } className="discover-dev-ledger-title">
										{ path.name }
									</Heading>
									{ path.badge && <Badge>{ path.badge }</Badge> }
								</HStack>
								<Text as="p" className="discover-dev-ledger-description">
									{ path.description }
								</Text>
								<code className="discover-dev-ledger-hint">{ path.hint }</code>
							</div>
							<div className="discover-dev-ledger-aside">
								<Button
									variant="secondary"
									href={ path.cta.href }
									target="_blank"
									rel="noopener noreferrer"
									__next40pxDefaultSize
									onClick={ () => trackClick( `ai_${ path.slug }` ) }
								>
									{ path.cta.label }
								</Button>
							</div>
						</div>
					) ) }
				</div>
			) }
		</VStack>
	);
}

function DevPipeline() {
	const trackClick = useDiscoverTracks( 'developers' );

	return (
		<VStack spacing={ 4 }>
			<SectionTitle
				title={ __( 'From local to live' ) }
				action={
					<Button
						variant="link"
						href={ localizeUrl( 'https://wordpress.com/support/github-deployments/' ) }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => trackClick( 'pipeline_docs' ) }
					>
						{ __( 'How deployments work' ) }
					</Button>
				}
			/>
			<ol className="discover-dev-pipeline">
				{ getDevPipelineSteps().map( ( step, index ) => (
					<li key={ step.title }>
						<span className="discover-dev-pipeline-marker">{ index + 1 }</span>
						<Heading level={ 3 } className="discover-dev-pipeline-title">
							{ step.title }
						</Heading>
						<Text as="p" className="discover-dev-pipeline-description">
							{ step.description }
						</Text>
					</li>
				) ) }
			</ol>
		</VStack>
	);
}

function DevAgencyDuo() {
	const trackClick = useDiscoverTracks( 'developers' );

	return (
		<VStack spacing={ 4 }>
			<SectionTitle title={ __( 'Run client sites at scale' ) } />
			<div className="discover-dev-duo">
				<div className="discover-dev-duo-card is-dark">
					<Text className="discover-dev-duo-eyebrow" as="p">
						{ __( 'Automattic for Agencies · Free to join' ) }
					</Text>
					<Heading level={ 3 } className="discover-dev-duo-title">
						{ __( 'Every client site, one command center' ) }
					</Heading>
					<Text as="p" className="discover-dev-duo-description">
						{ __(
							'Site management, updates, backups, and billing in one dashboard — with wholesale pricing, referral revenue, and five free development licenses to build on.'
						) }
					</Text>
					<div className="discover-dev-duo-action">
						<Button
							variant="secondary"
							className="discover-dev-duo-cta"
							href="https://automattic.com/for-agencies/"
							target="_blank"
							rel="noopener noreferrer"
							__next40pxDefaultSize
							onClick={ () => trackClick( 'agency_a4a' ) }
						>
							{ __( 'Join for free' ) }
						</Button>
					</div>
				</div>
				<div className="discover-dev-duo-card">
					<Text className="discover-dev-duo-eyebrow" as="p">
						{ __( 'The new Hosting Dashboard' ) }
					</Text>
					<Heading level={ 3 } className="discover-dev-duo-title">
						{ __( 'One dashboard. Every site. One click away.' ) }
					</Heading>
					<Text as="p" className="discover-dev-duo-description">
						{ __(
							'Persistent, wp-admin-aligned navigation whether you run 2 sites or 200. Check plugin updates across every site in one view, and switch without losing your place. You’re in it right now.'
						) }
					</Text>
					<div className="discover-dev-duo-action">
						<Button
							variant="secondary"
							href="/sites"
							__next40pxDefaultSize
							onClick={ () => trackClick( 'agency_dashboard' ) }
						>
							{ __( 'Explore your sites' ) }
						</Button>
					</div>
				</div>
			</div>
		</VStack>
	);
}

export default function DeveloperDiscover() {
	return (
		<>
			<DevHero />
			<PageLayout>
				<VStack spacing={ 14 }>
					<DevAiPaths />
					<VideoTutorials
						videos={ DEV_VIDEOS }
						audience="developers"
						title={ __( 'Watch what WordPress can do for developers' ) }
					/>
					<DevPipeline />
					<DevAgencyDuo />
					<HelpStrip links={ getDeveloperHelpLinks() } audience="developers" />
				</VStack>
			</PageLayout>
		</>
	);
}
