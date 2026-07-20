/**
 * Prototype: site overview for developers & power users (Advanced workspace).
 * Rendered for the three mock blogger sites. All tiers share the same layout
 * and cards; content varies per site, and cards whose features require the
 * Business plan (staging, deployments, SSH, logs, plugins) become upsells on
 * Free/Premium. Color communicates urgency: healthy states are green or
 * neutral, anything that deserves attention is amber.
 */
import { Badge } from '@automattic/ui';
import {
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	privateApis,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import {
	backup,
	cloudUpload,
	code,
	copy,
	key,
	lockOutline,
	moreVertical,
	wordpress,
} from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import clsx from 'clsx';
import { useState } from 'react';
import { Card, CardBody, CardHeader } from '../../components/card';
import OverviewCard from '../../components/overview-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Stat } from '../../components/stat';
import { SummaryButtonCardFooter } from '../../components/summary-button-card-footer';
import { Text } from '../../components/text';
import { getMockBloggerSite, SOLO_BLOGGER_SITE_SLUG } from './../overview-blogger/mock-sites';
import type { BloggerTier } from './../overview-blogger/mock-sites';
import type { Site } from '@automattic/api-core';
import type { ReactNode } from 'react';

import './style.scss';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

const SSH_COMMAND = 'ssh lucastravels.wordpress.com@sftp.wp.com';

const planLink = ( site: Site ) => `https://wordpress.com/plans/${ site.slug }`;

// Stretches the SectionHeader across the card so its actions right-align;
// same idiom as overview-domains-card.
const CARD_HEADER_STYLE: React.CSSProperties = {
	flexDirection: 'column',
	alignItems: 'stretch',
};

interface Vital {
	strapline: string;
	metric: string;
	description: string;
	tone?: 'warning';
}

const TIER_VITALS: Record< BloggerTier, Vital[] > = {
	free: [
		{ strapline: 'Uptime (30d)', metric: '99.98%', description: 'No incidents' },
		{ strapline: 'Response time', metric: '412 ms', description: 'avg, 24h' },
		{ strapline: 'Cache hit rate', metric: '88%', description: 'edge cache' },
		{ strapline: 'Visitors (7d)', metric: '214', description: '+3% week over week' },
		{ strapline: 'Requests (7d)', metric: '3.1k', description: '+2% week over week' },
	],
	premium: [
		{ strapline: 'Uptime (30d)', metric: '99.99%', description: 'No incidents' },
		{ strapline: 'Response time', metric: '268 ms', description: 'avg, 24h' },
		{ strapline: 'Cache hit rate', metric: '93%', description: 'edge cache' },
		{ strapline: 'Visitors (7d)', metric: '1.8k', description: '+12% week over week' },
		{ strapline: 'Requests (7d)', metric: '12.4k', description: '+9% week over week' },
	],
	business: [
		{ strapline: 'Uptime (30d)', metric: '99.99%', description: 'No incidents' },
		{ strapline: 'Response time', metric: '187 ms', description: 'avg, 24h' },
		{ strapline: 'Cache hit rate', metric: '96%', description: 'edge cache' },
		{
			strapline: 'PHP errors (24h)',
			metric: '3',
			description: '2 warnings, 1 deprecated',
			tone: 'warning',
		},
		{ strapline: 'Requests (7d)', metric: '58.2k', description: '+6% week over week' },
	],
};

interface EnvRow {
	label: string;
	value: ReactNode;
}

function EnvRows( { rows }: { rows: EnvRow[] } ) {
	return (
		<div className="dev-overview-env__rows">
			{ rows.map( ( row ) => (
				<HStack key={ row.label } justify="space-between" alignment="center" spacing={ 4 }>
					<Text variant="muted" size={ 12 } lineHeight="20px">
						{ row.label }
					</Text>
					{ typeof row.value === 'string' ? (
						<Text size={ 12 } lineHeight="20px" style={ { textAlign: 'end' } }>
							{ row.value }
						</Text>
					) : (
						row.value
					) }
				</HStack>
			) ) }
		</div>
	);
}

function EnvironmentCard( {
	title,
	badge,
	badgeIntent,
	rows,
	footerTitle,
	footerHref,
}: {
	title: string;
	badge: string;
	badgeIntent?: 'success' | 'warning';
	rows: EnvRow[];
	footerTitle?: string;
	footerHref?: string;
} ) {
	return (
		<Card role="article" className="dev-overview-env">
			<CardHeader style={ CARD_HEADER_STYLE }>
				<SectionHeader
					title={ title }
					level={ 3 }
					actions={ <Badge intent={ badgeIntent }>{ badge }</Badge> }
				/>
			</CardHeader>
			<CardBody>
				<EnvRows rows={ rows } />
			</CardBody>
			{ footerTitle && footerHref && (
				<SummaryButtonCardFooter title={ footerTitle } href={ footerHref } density="medium" />
			) }
		</Card>
	);
}

const TIER_ACTIVE_THEME: Record< BloggerTier, string > = {
	free: 'Stewart',
	premium: 'Dorna',
	business: 'Lente',
};

function SoftwareCard( { site, tier }: { site: Site; tier: BloggerTier } ) {
	const isBusiness = tier === 'business';

	return (
		<Card role="article" className="dev-overview-fill">
			<CardHeader style={ CARD_HEADER_STYLE }>
				<SectionHeader title="Software" level={ 3 } />
			</CardHeader>
			<CardBody>
				<EnvRows
					rows={ [
						{
							label: 'WordPress',
							value: (
								<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
									<Text size={ 12 } lineHeight="20px">
										7.0.1
									</Text>
									<Badge intent="success">Up to date</Badge>
								</HStack>
							),
						},
						{
							label: 'PHP',
							value: isBusiness ? (
								<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
									<Text size={ 12 } lineHeight="20px">
										8.3
									</Text>
									<Button
										variant="link"
										size="small"
										href={ `https://wordpress.com/hosting-config/${ site.slug }` }
									>
										Change
									</Button>
								</HStack>
							) : (
								'8.3'
							),
						},
						isBusiness
							? {
									label: 'Plugin updates',
									value: <Badge intent="warning">2 available</Badge>,
							  }
							: {
									label: 'Plugins',
									value: (
										<Button variant="link" size="small" href={ planLink( site ) }>
											Available on Business
										</Button>
									),
							  },
						{
							label: 'Vulnerabilities',
							value: <Badge intent="success">None detected</Badge>,
						},
						{ label: 'Active theme', value: TIER_ACTIVE_THEME[ tier ] },
						{
							label: 'Malware scan',
							value: isBusiness ? 'Clean · 2h ago' : 'Managed by WordPress.com',
						},
					] }
				/>
			</CardBody>
			{ isBusiness ? (
				<SummaryButtonCardFooter
					title="Review plugin updates"
					href={ `${ site.options?.admin_url }plugins.php` }
					density="medium"
				/>
			) : (
				<SummaryButtonCardFooter
					title="Upgrade to install plugins"
					href={ planLink( site ) }
					density="medium"
				/>
			) }
		</Card>
	);
}

const TIER_SCORES: Record< BloggerTier, { desktop: number; mobile: number; lastRun: string } > = {
	free: { desktop: 88, mobile: 71, lastRun: '1 day ago' },
	premium: { desktop: 91, mobile: 78, lastRun: '3 days ago' },
	business: { desktop: 82, mobile: 74, lastRun: '2 hours ago' },
};

function ScoreStat( { label, score }: { label: string; score: number } ) {
	const isGood = score >= 90;
	return (
		<Stat
			density="high"
			strapline={ label }
			metric={ String( score ) }
			description={ isGood ? 'Excellent' : 'Needs Improvement' }
			progressValue={ score }
			progressLabel={ `${ score } out of 100` }
			progressColor={ isGood ? 'alert-green' : 'alert-yellow' }
		/>
	);
}

function SpeedTestCard( { site, tier }: { site: Site; tier: BloggerTier } ) {
	const scores =
		site.slug === SOLO_BLOGGER_SITE_SLUG
			? { desktop: 76, mobile: 58, lastRun: '5 hours ago' }
			: TIER_SCORES[ tier ];

	return (
		<Card role="article" className="dev-overview-fill">
			<CardHeader style={ CARD_HEADER_STYLE }>
				<SectionHeader
					title="Performance test"
					level={ 3 }
					actions={
						<Button variant="secondary" size="compact">
							Run test
						</Button>
					}
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 }>
					<ScoreStat label="Desktop score" score={ scores.desktop } />
					<ScoreStat label="Mobile score" score={ scores.mobile } />
					<Text variant="muted" size={ 12 } lineHeight="20px">
						Last test ran { scores.lastRun }.
					</Text>
				</VStack>
			</CardBody>
			<SummaryButtonCardFooter
				title="Performance report"
				href={ `/sites/${ site.slug }/performance` }
				density="medium"
			/>
		</Card>
	);
}

const TIER_PLAN_META: Record<
	BloggerTier,
	{ planName: string; storageUsed: string; storageMax: string; storagePercent: number }
> = {
	free: { planName: 'Free plan', storageUsed: '0.6 GB', storageMax: '1 GB', storagePercent: 60 },
	premium: {
		planName: 'Premium plan',
		storageUsed: '3.2 GB',
		storageMax: '13 GB',
		storagePercent: 25,
	},
	business: {
		planName: 'Business plan',
		storageUsed: '4.6 GB',
		storageMax: '50 GB',
		storagePercent: 9,
	},
};

function ResourcesCard( { site, tier }: { site: Site; tier: BloggerTier } ) {
	const isBusiness = tier === 'business';
	const meta =
		site.slug === SOLO_BLOGGER_SITE_SLUG
			? {
					planName: 'Premium plan',
					storageUsed: '12.2 GB',
					storageMax: '13 GB',
					storagePercent: 94,
			  }
			: TIER_PLAN_META[ tier ];

	return (
		<Card role="article" className="dev-overview-fill">
			<CardHeader style={ CARD_HEADER_STYLE }>
				<SectionHeader
					title="Plan & resources"
					level={ 3 }
					actions={ <Badge>{ meta.planName }</Badge> }
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 }>
					<Stat
						density="high"
						strapline="Storage"
						metric={ meta.storageUsed }
						description={ meta.storageMax }
						progressValue={ meta.storagePercent }
						progressLabel={ `${ meta.storagePercent }%` }
						progressColor={ meta.storagePercent >= 90 ? 'alert-red' : undefined }
					/>
					{ isBusiness && (
						<Stat
							density="high"
							strapline="CPU load"
							metric="11%"
							description="avg, 24h"
							progressValue={ 11 }
							progressLabel="11%"
						/>
					) }
					<Stat density="high" strapline="Bandwidth" metric="Unlimited" />
					{ ! isBusiness && (
						<Text variant="muted" size={ 12 } lineHeight="20px">
							CPU and server metrics come with the Business plan.
						</Text>
					) }
				</VStack>
			</CardBody>
			<SummaryButtonCardFooter title="Manage plan" href={ planLink( site ) } density="medium" />
		</Card>
	);
}

function EnvironmentsSection( {
	site,
	tier,
	columns,
	gap,
}: {
	site: Site;
	tier: BloggerTier;
	columns: number;
	gap: number;
} ) {
	const isBusiness = tier === 'business';

	return (
		<VStack spacing={ 4 }>
			<SectionHeader title="Environments" level={ 2 } />
			<Grid columns={ columns } gap={ gap }>
				<EnvironmentCard
					title="Production"
					badge="Live"
					badgeIntent="success"
					rows={
						isBusiness
							? [
									{ label: 'URL', value: 'lucastravels.com' },
									{ label: 'WordPress', value: '7.0.1' },
									{ label: 'PHP', value: '8.3' },
									{ label: 'Object cache', value: 'Enabled' },
									{ label: 'CDN', value: 'Active' },
							  ]
							: [
									{ label: 'URL', value: site.slug },
									{ label: 'WordPress', value: '7.0.1' },
									{ label: 'PHP', value: '8.3' },
									{ label: 'CDN', value: 'Active' },
							  ]
					}
					footerTitle={ isBusiness ? 'Server settings' : 'Site settings' }
					footerHref={
						isBusiness
							? `https://wordpress.com/hosting-config/${ site.slug }`
							: `/sites/${ site.slug }/settings`
					}
				/>
				{ isBusiness ? (
					<EnvironmentCard
						title="Staging"
						badge="Synced"
						badgeIntent="success"
						rows={ [
							{ label: 'URL', value: 'staging-4021.lucastravels.com' },
							{ label: 'WordPress', value: '7.0.1' },
							{ label: 'PHP', value: '8.3' },
							{ label: 'Last synced', value: '2 days ago' },
						] }
						footerTitle="Manage staging"
						footerHref={ `https://wordpress.com/staging-site/${ site.slug }` }
					/>
				) : (
					<OverviewCard
						title="Staging"
						icon={ copy }
						heading="Test before you ship"
						description="A one-click copy of your site to try changes safely. Included in the Business plan."
						intent="upsell"
						link={ planLink( site ) }
					/>
				) }
				{ isBusiness ? (
					<EnvironmentCard
						title="Deployments"
						badge="Passing"
						badgeIntent="success"
						rows={ [
							{ label: 'Repository', value: 'lucasmdo/lucastravels-theme' },
							{ label: 'Branch', value: 'main' },
							{ label: 'Last deploy', value: '2h ago · a1b2c3d' },
							{ label: 'Mode', value: 'Automatic on push' },
						] }
						footerTitle="Deployment history"
						footerHref={ `https://wordpress.com/github-deployments/${ site.slug }` }
					/>
				) : (
					<OverviewCard
						title="Deployments"
						icon={ cloudUpload }
						heading="Deploy from GitHub"
						description="Connect a repository and ship on every push. Included in the Business plan."
						intent="upsell"
						link={ planLink( site ) }
					/>
				) }
			</Grid>
		</VStack>
	);
}

function AccessSection( {
	site,
	tier,
	columns,
	gap,
}: {
	site: Site;
	tier: BloggerTier;
	columns: number;
	gap: number;
} ) {
	const isBusiness = tier === 'business';

	return (
		<VStack spacing={ 4 }>
			<SectionHeader title="Access & safety" level={ 2 } />
			<Grid columns={ columns } gap={ gap }>
				<OverviewCard
					title="SSL certificate"
					icon={ lockOutline }
					heading="Valid"
					description="Let’s Encrypt · renews automatically on September 12, 2026."
					intent="success"
				/>
				{ isBusiness ? (
					<OverviewCard
						title="Developer access"
						icon={ key }
						heading="SSH enabled"
						description="2 SSH keys · SFTP on · WP-CLI available."
						link={ `https://wordpress.com/hosting-config/${ site.slug }` }
					/>
				) : (
					<OverviewCard
						title="Developer access"
						icon={ key }
						heading="SSH & WP-CLI"
						description="Shell access, SFTP, and WP-CLI are included in the Business plan."
						intent="upsell"
						link={ planLink( site ) }
					/>
				) }
				{ isBusiness ? (
					<OverviewCard
						title="Backups"
						icon={ backup }
						heading="1h ago"
						description="30 restore points · daily and on-demand."
						intent="success"
						link={ `https://wordpress.com/backup/${ site.slug }` }
					/>
				) : (
					<OverviewCard
						title="Backups"
						icon={ backup }
						heading="Daily backups"
						description="One-click restores and 30 restore points come with the Business plan."
						intent="upsell"
						link={ planLink( site ) }
					/>
				) }
			</Grid>
		</VStack>
	);
}

type LogKind = 'php' | 'deploy' | 'crawler';

const LOG_FILTERS: { value: LogKind | 'all'; label: string }[] = [
	{ value: 'all', label: 'All' },
	{ value: 'php', label: 'PHP' },
	{ value: 'deploy', label: 'Deploys' },
];

// Severity badge classes reuse the color overrides from the Logs pages
// (badge--warning, badge--deprecated, …) so both surfaces stay in sync.
const LOG_LINES: {
	severity: string;
	severityClass: string;
	date: string;
	message: string;
	kind: LogKind;
}[] = [
	{
		severity: 'AI Crawler',
		severityClass: 'crawler',
		date: 'Jul 17, 2026, 6:12 AM',
		message: 'GPTBot/2.1 fetched /sitemap.xml and 48 posts (200)',
		kind: 'crawler',
	},
	{
		severity: 'Warning',
		severityClass: 'warning',
		date: 'Jul 16, 2026, 2:02 PM',
		message:
			'PHP Warning: Undefined array key "lat" in wp-content/plugins/jetpack/modules/geo/geo.php on line 87',
		kind: 'php',
	},
	{
		severity: 'Deprecated',
		severityClass: 'deprecated',
		date: 'Jul 16, 2026, 9:47 AM',
		message:
			'PHP Deprecated: strpos(): Passing null to parameter #1 in wp-content/themes/lente/functions.php on line 142',
		kind: 'php',
	},
	{
		severity: 'Warning',
		severityClass: 'warning',
		date: 'Jul 15, 2026, 10:15 PM',
		message:
			'PHP Warning: Attempt to read property "ID" on null in wp-content/plugins/related-posts/render.php on line 51',
		kind: 'php',
	},
	{
		severity: 'AI Crawler',
		severityClass: 'crawler',
		date: 'Jul 15, 2026, 8:41 PM',
		message: 'ClaudeBot/1.0 crawled 214 pages · robots.txt honored',
		kind: 'crawler',
	},
	{
		severity: 'Deploy',
		severityClass: 'deploy',
		date: 'Jul 14, 2026, 6:03 PM',
		message: 'Deployment of lucasmdo/lucastravels-theme@main finished in 41s (a1b2c3d)',
		kind: 'deploy',
	},
	{
		severity: 'Deploy',
		severityClass: 'deploy',
		date: 'Jul 12, 2026, 9:15 AM',
		message: 'Deployment of lucasmdo/lucastravels-theme@main finished in 38s (e4f5a6b)',
		kind: 'deploy',
	},
];

function LogsCard( { site, tier }: { site: Site; tier: BloggerTier } ) {
	const [ filter, setFilter ] = useState< LogKind | 'all' >( 'all' );
	const isBusiness = tier === 'business';
	const visibleLines =
		filter === 'all' ? LOG_LINES : LOG_LINES.filter( ( line ) => line.kind === filter );

	if ( ! isBusiness ) {
		return (
			<Card role="article" className="dev-overview-logs">
				<CardHeader style={ CARD_HEADER_STYLE }>
					<SectionHeader title="Latest log entries" level={ 3 } />
				</CardHeader>
				<CardBody>
					<VStack spacing={ 3 } alignment="left">
						<Text variant="muted">
							PHP error and web server logs are included in the Business plan. Watch errors,
							deploys, and traffic as they happen.
						</Text>
						<Button variant="secondary" size="compact" href={ planLink( site ) }>
							Upgrade to Business
						</Button>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card role="article" className="dev-overview-logs">
			<CardHeader style={ CARD_HEADER_STYLE }>
				<SectionHeader
					title="Latest log entries"
					level={ 3 }
					actions={
						<Button
							variant="secondary"
							size="compact"
							href={ `https://wordpress.com/site-logs/${ site.slug }/php` }
						>
							Open logs
						</Button>
					}
				/>
			</CardHeader>
			<CardBody>
				<Tabs
					selectedTabId={ filter }
					onSelect={ ( tabId: string | null | undefined ) =>
						setFilter( ( tabId ?? 'all' ) as LogKind | 'all' )
					}
				>
					<VStack spacing={ 3 }>
						<Tabs.TabList>
							{ LOG_FILTERS.map( ( { value, label } ) => (
								<Tabs.Tab key={ value } tabId={ value }>
									{ label }
								</Tabs.Tab>
							) ) }
						</Tabs.TabList>
						<Tabs.TabPanel tabId={ filter }>
							<table className="dev-overview-logs__table">
								<thead>
									<tr>
										<th scope="col">Severity</th>
										<th scope="col">Date & time (UTC)</th>
										<th scope="col">Message</th>
									</tr>
								</thead>
								<tbody>
									{ visibleLines.map( ( line ) => (
										<tr key={ line.date }>
											<td>
												<Badge intent="default" className={ `badge--${ line.severityClass }` }>
													{ line.severity }
												</Badge>
											</td>
											<td className="dev-overview-logs__date">{ line.date }</td>
											<td>{ line.message }</td>
										</tr>
									) ) }
								</tbody>
							</table>
						</Tabs.TabPanel>
					</VStack>
				</Tabs>
			</CardBody>
		</Card>
	);
}

// Developer-flavored Business upsell: the pitch is the platform this page
// keeps showing as locked — SSH/WP-CLI, plugins, staging, deployments, logs.
// Business sites get no banner; there is nothing left to sell.
const DEV_PROMO_CONTENT: Record<
	'free' | 'premium',
	{ title: string; body: string; terminal: { command: string; comment?: string }[] }
> = {
	free: {
		title: 'Bring your own workflow',
		body: 'Business unlocks the developer platform under this site — SSH and WP-CLI, custom plugins and themes, a staging site, and GitHub deployments.',
		terminal: [
			{ command: 'wp plugin install wp-graphql --activate' },
			{ command: 'git push origin main', comment: '# deploys in ~40s' },
		],
	},
	premium: {
		title: 'One plan away from full control',
		body: 'Everything locked on this page ships with Business — SSH and WP-CLI, staging, GitHub deployments, and live server logs.',
		terminal: [
			{ command: 'wp theme activate dorna' },
			{ command: 'tail -f logs/php-errors.log' },
		],
	},
};

function DevPromoBanner( { site, tier }: { site: Site; tier: BloggerTier } ) {
	if ( tier === 'business' ) {
		return null;
	}
	const content = DEV_PROMO_CONTENT[ tier ];
	const terminalLines = [ { command: `ssh ${ site.slug }@sftp.wp.com` }, ...content.terminal ];

	return (
		<div className="dev-overview-promo">
			<VStack spacing={ 5 } alignment="left">
				<h2 className="dev-overview-promo__title">{ content.title }</h2>
				<p className="dev-overview-promo__body">{ content.body }</p>
				<Button
					__next40pxDefaultSize
					variant="primary"
					className="dev-overview-promo__button"
					href={ planLink( site ) }
				>
					Upgrade to Business
				</Button>
			</VStack>
			<div className="dev-overview-promo__terminal" aria-hidden="true">
				<div className="dev-overview-promo__terminal-bar">
					<i></i>
					<i></i>
					<i></i>
				</div>
				{ terminalLines.map( ( line ) => (
					<p key={ line.command } className="dev-overview-promo__terminal-line">
						<span className="dev-overview-promo__prompt">$</span> { line.command }
						{ line.comment && (
							<span className="dev-overview-promo__comment"> { line.comment }</span>
						) }
					</p>
				) ) }
			</div>
		</div>
	);
}

function QuickActionsMenu( { site }: { site: Site } ) {
	return (
		<DropdownMenu icon={ moreVertical } label="Quick actions">
			{ ( { onClose }: { onClose: () => void } ) => (
				<MenuGroup>
					<MenuItem onClick={ onClose }>Purge edge cache</MenuItem>
					<MenuItem onClick={ onClose }>Clear object cache</MenuItem>
					<MenuItem
						onClick={ () => {
							window.open(
								`https://wordpress.com/hosting-config/${ site.slug }`,
								'_blank',
								'noreferrer,noopener'
							);
							onClose();
						} }
					>
						Open phpMyAdmin ↗
					</MenuItem>
					<MenuItem onClick={ onClose }>Download latest backup</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}

export default function DeveloperSiteOverview( { siteSlug }: { siteSlug: string } ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const mock = getMockBloggerSite( siteSlug );

	if ( ! mock ) {
		return null;
	}

	const { site, tier } = mock;
	const isBusiness = tier === 'business';
	const spacing = isSmallViewport ? 4 : 6;
	const envColumns = isSmallViewport ? 1 : 3;

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ site.name }
					description={
						<Text variant="muted">WordPress 7.0.1 · PHP 8.3 · Hosted on WordPress.com</Text>
					}
					actions={
						<>
							{ isBusiness && <QuickActionsMenu site={ site } /> }
							{ isBusiness && (
								<Button
									__next40pxDefaultSize
									variant="secondary"
									icon={ code }
									onClick={ () => window.navigator.clipboard?.writeText( SSH_COMMAND ) }
								>
									Copy SSH command
								</Button>
							) }
							<Button
								__next40pxDefaultSize
								variant="primary"
								href={ site.options?.admin_url }
								icon={ wordpress }
							>
								WP Admin
							</Button>
						</>
					}
				/>
			}
		>
			<VStack alignment="stretch" spacing={ isSmallViewport ? 5 : 10 }>
				<Card role="article">
					<CardBody>
						<Grid columns={ isSmallViewport ? 2 : 5 } gap={ spacing }>
							{ TIER_VITALS[ tier ].map( ( vital ) => (
								<div
									key={ vital.strapline }
									className={ clsx( 'dev-overview-vital', {
										'is-warning': vital.tone === 'warning',
									} ) }
								>
									<Stat
										density="high"
										strapline={ vital.strapline }
										metric={ vital.metric }
										description={ vital.description }
									/>
								</div>
							) ) }
						</Grid>
					</CardBody>
				</Card>

				<VStack spacing={ 4 }>
					<SectionHeader title="Site health" level={ 2 } />
					<Grid columns={ envColumns } gap={ spacing }>
						<SoftwareCard site={ site } tier={ tier } />
						<SpeedTestCard site={ site } tier={ tier } />
						<ResourcesCard site={ site } tier={ tier } />
					</Grid>
				</VStack>

				<EnvironmentsSection site={ site } tier={ tier } columns={ envColumns } gap={ spacing } />

				<AccessSection site={ site } tier={ tier } columns={ envColumns } gap={ spacing } />

				<LogsCard site={ site } tier={ tier } />

				<DevPromoBanner site={ site } tier={ tier } />
			</VStack>
		</PageLayout>
	);
}
