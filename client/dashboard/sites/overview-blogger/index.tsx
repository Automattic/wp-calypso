/**
 * Prototype: site overview reimagined for bloggers & creators.
 * Rendered for the three mock sites defined in ./mock-sites.ts, one per plan
 * tier. All tiers share the same layout and card set (Visibility, Backup,
 * Scan, Performance, Plan); content varies per site, and cards whose features
 * require the Business plan become upsells on Free/Premium. Each tier keeps
 * its own promo banner.
 */
import { localizeUrl } from '@automattic/i18n-utils';
import {
	__experimentalDivider as Divider,
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Icon,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import {
	backup,
	chartBar,
	check,
	chevronRight,
	comment,
	envelope,
	external,
	help,
	image,
	lockOutline,
	megaphone,
	page,
	pencil,
	people,
	plugins,
	published,
	rss,
	shield,
	starFilled,
	video,
	wordpress,
} from '@wordpress/icons';
import clsx from 'clsx';
import { useHelpCenter } from '../../app/help-center';
import { Card, CardBody, CardHeader } from '../../components/card';
import OverviewCard from '../../components/overview-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Stat } from '../../components/stat';
import { SummaryButtonCardFooter } from '../../components/summary-button-card-footer';
import { Text } from '../../components/text';
import { getMockBloggerSite, SOLO_BLOGGER_SITE_SLUG } from './mock-sites';
import type { BloggerTier } from './mock-sites';
import type { Site } from '@automattic/api-core';
import type { ReactElement, ReactNode } from 'react';
import './style.scss';

const SPACING = {
	DEFAULT: 6,
	SMALL: 4,
};

interface ActivityItem {
	icon: ReactElement;
	text: string;
	meta: string;
}

function getGridLayout( {
	count,
	isLargeViewport,
	isSmallViewport,
}: {
	count: number;
	isLargeViewport: boolean;
	isSmallViewport: boolean;
} ) {
	if ( isLargeViewport ) {
		return { columns: count, rows: 1 };
	}
	if ( isSmallViewport ) {
		return { columns: 1, rows: count };
	}
	return { columns: 2, rows: Math.ceil( count / 2 ) };
}

const TIER_PREVIEW_THEME: Record< BloggerTier, string > = {
	free: 'lettre',
	premium: 'dorna',
	business: 'stewart',
};

function SitePreviewColumn( { site, tier }: { site: Site; tier: BloggerTier } ) {
	return (
		<Card className="blogger-overview-preview">
			<a href={ site.URL } target="_blank" rel="noreferrer">
				<img
					src={ `https://s0.wp.com/wp-content/themes/pub/${ TIER_PREVIEW_THEME[ tier ] }/screenshot.png` }
					alt={ `Preview of ${ site.name }` }
				/>
				<span className="blogger-overview-preview__overlay">
					<span className="blogger-overview-preview__label">Visit your site</span>
				</span>
			</a>
		</Card>
	);
}

interface SupportLink {
	icon: ReactElement;
	label: string;
	href: string;
	external?: boolean;
}

const SUPPORT_GUIDES: SupportLink[] = [
	{
		icon: page,
		label: 'Write and schedule posts',
		href: localizeUrl( 'https://wordpress.com/support/posts/' ),
	},
	{
		icon: page,
		label: 'Connect a custom domain',
		href: localizeUrl( 'https://wordpress.com/support/domains/' ),
	},
	{
		icon: page,
		label: 'Change your site’s look',
		href: localizeUrl( 'https://wordpress.com/support/themes/' ),
	},
	{
		icon: page,
		label: 'Grow your audience',
		href: localizeUrl( 'https://wordpress.com/support/category/grow-your-audience/' ),
	},
];

const SUPPORT_RESOURCES: SupportLink[] = [
	{
		icon: backup,
		label: 'Support history',
		href: 'https://wordpress.com/help',
	},
	{
		icon: video,
		label: 'Courses',
		href: localizeUrl( 'https://wordpress.com/learn/' ),
		external: true,
	},
	{
		icon: rss,
		label: 'Product updates',
		href: localizeUrl( 'https://wordpress.com/blog/' ),
		external: true,
	},
];

function SupportLinkList( { links }: { links: SupportLink[] } ) {
	return (
		<div className="blogger-overview-support__list">
			{ links.map( ( link ) => (
				<a
					key={ link.label }
					className="blogger-overview-support__row"
					href={ link.href }
					{ ...( link.external ? { target: '_blank', rel: 'noreferrer' } : {} ) }
				>
					<Icon icon={ link.icon } size={ 20 } />
					<span className="blogger-overview-support__row-label">{ link.label }</span>
					<Icon
						className="blogger-overview-support__row-indicator"
						icon={ link.external ? external : chevronRight }
						size={ 20 }
					/>
				</a>
			) ) }
		</div>
	);
}

function VisibilityCard() {
	return (
		<OverviewCard
			title="Visibility"
			icon={ published }
			heading="Public"
			description="Anyone can view your site."
			intent="success"
		/>
	);
}

function StorageStat( {
	used,
	max,
	percent,
	progressColor,
}: {
	used: string;
	max: string;
	percent: number;
	progressColor?: 'alert-yellow' | 'alert-red' | 'alert-green';
} ) {
	return (
		<Stat
			density="high"
			strapline="Storage"
			metric={ used }
			description={ max }
			progressValue={ Math.max( 2.5, percent ) }
			progressLabel={ `${ percent }%` }
			progressColor={ progressColor }
		/>
	);
}

function BandwidthStat() {
	return <Stat density="high" strapline="Bandwidth" metric="Unlimited" />;
}

function ActivityCard( {
	site,
	items,
	emptyState,
}: {
	site: Site;
	items: ActivityItem[];
	emptyState?: ReactNode;
} ) {
	return (
		<Card role="article" className="blogger-overview-activity">
			<CardHeader>
				<SectionHeader title="Latest activity" level={ 3 } />
			</CardHeader>
			<CardBody>
				{ items.length === 0 ? (
					emptyState
				) : (
					<VStack spacing={ 4 }>
						{ items.map( ( item ) => (
							<HStack key={ item.text } spacing={ 3 } justify="flex-start" alignment="center">
								<span className="blogger-overview-activity__icon">
									<Icon icon={ item.icon } size={ 24 } />
								</span>
								<VStack spacing={ 1 }>
									<Text weight={ 500 }>{ item.text }</Text>
									<Text variant="muted" size={ 12 } lineHeight="16px">
										{ item.meta }
									</Text>
								</VStack>
							</HStack>
						) ) }
					</VStack>
				) }
			</CardBody>
			{ items.length > 0 && (
				<SummaryButtonCardFooter
					title="See all activity"
					href={ `https://wordpress.com/activity-log/${ site.slug }` }
					density="medium"
				/>
			) }
		</Card>
	);
}

function BackupCard( { site, tier }: { site: Site; tier: BloggerTier } ) {
	if ( tier === 'business' ) {
		return (
			<OverviewCard
				title="Last backup"
				icon={ backup }
				heading="1h ago"
				description="Today at 3:43 PM."
				intent="success"
			/>
		);
	}
	return (
		<OverviewCard
			title="Last backup"
			icon={ backup }
			heading="Your posts aren’t backed up"
			description="Automatic daily backups and one-click restores come with the Business plan."
			intent="upsell"
			link={ `https://wordpress.com/plans/${ site.slug }` }
		/>
	);
}

function ScanCard( { site, tier }: { site: Site; tier: BloggerTier } ) {
	if ( tier === 'business' ) {
		return (
			<OverviewCard
				title="Last scan"
				icon={ shield }
				heading="No risks found"
				description="We check your site every day."
				intent="success"
			/>
		);
	}
	return (
		<OverviewCard
			title="Last scan"
			icon={ shield }
			heading="Add daily security scans"
			description="We’ll check your site for malware and threats every day with the Business plan."
			intent="upsell"
			link={ `https://wordpress.com/plans/${ site.slug }` }
		/>
	);
}

const TIER_PERFORMANCE: Record<
	BloggerTier,
	{ heading: string; description: string; intent: 'success' | 'warning' }
> = {
	free: {
		heading: 'Could be faster',
		description: 'Your homepage takes 4.6 seconds to load on phones. See what to fix.',
		intent: 'warning',
	},
	premium: {
		heading: 'Looking good',
		description: 'Your site loads quickly for most visitors.',
		intent: 'success',
	},
	business: {
		heading: 'Could be faster',
		description: 'Large images are slowing your homepage. Fix them in one click.',
		intent: 'warning',
	},
};

function PerformanceCard( { site, tier }: { site: Site; tier: BloggerTier } ) {
	const content =
		site.slug === SOLO_BLOGGER_SITE_SLUG
			? {
					heading: 'Slow on photo pages',
					description:
						'Pages with many large images take 5.8 seconds to load. Compress them to speed things up.',
					intent: 'warning' as const,
			  }
			: TIER_PERFORMANCE[ tier ];
	return (
		<OverviewCard
			title="Performance"
			icon={ chartBar }
			heading={ content.heading }
			description={ content.description }
			intent={ content.intent }
			link={ `/sites/${ site.slug }/performance` }
		/>
	);
}

function PlanCard( { site, tier }: { site: Site; tier: BloggerTier } ) {
	switch ( tier ) {
		case 'free':
			return (
				<OverviewCard
					title="Plan"
					icon={ wordpress }
					heading="Free"
					description="Upgrade for more space, a free domain, and no ads."
					link={ `https://wordpress.com/plans/${ site.slug }` }
					bottom={
						<VStack spacing={ 4 }>
							<StorageStat used="118 MB" max="1 GB" percent={ 12 } />
							<Text variant="muted" lineHeight="16px" size={ 12 }>
								Photos and videos fill this fast — paid plans start at 13 GB.
							</Text>
						</VStack>
					}
				/>
			);
		case 'premium':
			if ( site.slug === SOLO_BLOGGER_SITE_SLUG ) {
				return (
					<OverviewCard
						title="Plan"
						icon={ wordpress }
						heading="Premium"
						description="Renews on March 3, 2027."
						link={ `https://wordpress.com/plans/${ site.slug }` }
						bottom={
							<VStack spacing={ 4 }>
								<StorageStat used="12.2 GB" max="13 GB" percent={ 94 } progressColor="alert-red" />
								<Text variant="muted" lineHeight="16px" size={ 12 }>
									Storage almost full — the Business plan includes 50 GB.
								</Text>
							</VStack>
						}
					/>
				);
			}
			return (
				<OverviewCard
					title="Plan"
					icon={ wordpress }
					heading="Premium"
					description="Renews on December 6, 2026."
					link={ `https://wordpress.com/plans/my-plan/${ site.slug }` }
					bottom={
						<VStack spacing={ 4 }>
							<StorageStat used="452 MB" max="13 GB" percent={ 3 } />
							<BandwidthStat />
						</VStack>
					}
				/>
			);
		case 'business':
			return (
				<OverviewCard
					title="Plan"
					icon={ wordpress }
					heading="Business"
					description="Renews on December 12, 2026."
					link={ `https://wordpress.com/plans/my-plan/${ site.slug }` }
					bottom={
						<VStack spacing={ 4 }>
							<StorageStat used="4.6 GB" max="50 GB" percent={ 9 } />
							<BandwidthStat />
						</VStack>
					}
				/>
			);
	}
}

function DomainPromoBanner( { site }: { site: Site } ) {
	return (
		<div className="blogger-overview-promo is-domain">
			<HStack spacing={ 8 } justify="space-between" alignment="center" wrap>
				<VStack spacing={ 4 } alignment="flex-start">
					<h2 className="blogger-overview-promo__title">sunrisestories.blog is waiting for you</h2>
					<p className="blogger-overview-promo__description">
						Save up to 55% on annual plans and get your domain free for the first year — along with
						more space for your photos and no ads between your stories.
					</p>
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={ `https://wordpress.com/domains/add/${ site.slug }` }
					>
						Claim your domain
					</Button>
				</VStack>
				<div className="blogger-overview-promo__browser">
					<span className="blogger-overview-promo__browser-dots">
						<i />
						<i />
						<i />
					</span>
					<span className="blogger-overview-promo__browser-address">
						<Icon icon={ lockOutline } size={ 16 } />
						sunrisestories.blog
					</span>
				</div>
			</HStack>
		</div>
	);
}

function GrowPromoBanner( { site }: { site: Site } ) {
	const perks = [
		{ icon: envelope, label: 'Email newsletters, built in' },
		{ icon: megaphone, label: '$200 to promote your posts' },
		{ icon: video, label: 'Stunning 4K video' },
		{ icon: image, label: '4× the photo storage' },
	];

	return (
		<div className="blogger-overview-promo is-grow">
			<HStack spacing={ 8 } justify="space-between" alignment="center" wrap>
				<VStack spacing={ 4 } alignment="flex-start">
					<h2 className="blogger-overview-promo__title">
						Your next thousand readers are out there
					</h2>
					<p className="blogger-overview-promo__description">
						The Business plan is a growth kit for creators — reach new readers, keep them close with
						newsletters, and give your photos and videos all the room they deserve.
					</p>
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={ `https://wordpress.com/plans/${ site.slug }` }
					>
						Grow with Business
					</Button>
				</VStack>
				<div className="blogger-overview-promo__perks">
					{ perks.map( ( perk ) => (
						<span key={ perk.label } className="blogger-overview-promo__perk">
							<Icon icon={ perk.icon } size={ 20 } />
							{ perk.label }
						</span>
					) ) }
				</div>
			</HStack>
		</div>
	);
}

function MonetizePromoBanner( { site }: { site: Site } ) {
	return (
		<div className="blogger-overview-promo is-monetize">
			<HStack spacing={ 8 } justify="space-between" alignment="center" wrap>
				<VStack spacing={ 4 } alignment="flex-start">
					<h2 className="blogger-overview-promo__title">Turn your readers into income</h2>
					<p className="blogger-overview-promo__description">
						You have 1,024 subscribers. Offer them a paid newsletter or exclusive posts — you set
						the price, we handle the billing.
					</p>
					<Button
						__next40pxDefaultSize
						className="blogger-overview-promo__button-inverted"
						href={ `https://wordpress.com/earn/${ site.slug }` }
					>
						Set up paid subscriptions
					</Button>
				</VStack>
				<div className="blogger-overview-promo__earnings">
					<span className="blogger-overview-promo__earnings-label">
						If 5% of your subscribers pay $5/month
					</span>
					<span className="blogger-overview-promo__earnings-value">
						$256<small>/month</small>
					</span>
				</div>
			</HStack>
		</div>
	);
}

function PromoBanner( { site, tier }: { site: Site; tier: BloggerTier } ) {
	switch ( tier ) {
		case 'free':
			return <DomainPromoBanner site={ site } />;
		case 'premium':
			return <GrowPromoBanner site={ site } />;
		case 'business':
			return <MonetizePromoBanner site={ site } />;
	}
}

const TIER_ACTIVITY: Record< BloggerTier, ActivityItem[] > = {
	free: [
		{
			icon: pencil,
			text: 'Published “The first light of day”',
			meta: 'Yesterday',
		},
		{
			icon: people,
			text: 'Your first reader subscribed',
			meta: '2 days ago',
		},
		{
			icon: image,
			text: 'Uploaded 6 new photos',
			meta: '3 days ago',
		},
		{
			icon: page,
			text: 'Created the About page',
			meta: '4 days ago',
		},
		{
			icon: published,
			text: 'Your site went live',
			meta: 'Last week',
		},
		{
			icon: comment,
			text: 'Received your first comment',
			meta: 'Last week',
		},
		{
			icon: chartBar,
			text: 'Your busiest day yet — 12 visitors',
			meta: '2 weeks ago',
		},
		{
			icon: pencil,
			text: 'Started a draft: “Places I want to go”',
			meta: '2 weeks ago',
		},
		{
			icon: check,
			text: 'Completed your site setup checklist',
			meta: '2 weeks ago',
		},
		{
			icon: wordpress,
			text: 'Created your site',
			meta: '3 weeks ago',
		},
	],
	premium: [
		{
			icon: pencil,
			text: 'Published “Golden hour at the pier”',
			meta: '2 days ago',
		},
		{
			icon: image,
			text: 'Uploaded 14 new photos',
			meta: '4 days ago',
		},
		{
			icon: people,
			text: '4 people subscribed to your site',
			meta: '5 days ago',
		},
		{
			icon: page,
			text: 'Updated the About page',
			meta: 'Last week',
		},
		{
			icon: pencil,
			text: 'Published “Fog rolling over the marina”',
			meta: 'Last week',
		},
		{
			icon: starFilled,
			text: '“Golden hour at the pier” got 12 likes',
			meta: 'Last week',
		},
		{
			icon: comment,
			text: '6 new comments this week',
			meta: 'Last week',
		},
		{
			icon: envelope,
			text: 'Newsletter sent to 48 subscribers',
			meta: '2 weeks ago',
		},
		{
			icon: chartBar,
			text: 'Traffic spike — 320 views in one day',
			meta: '2 weeks ago',
		},
		{
			icon: video,
			text: 'Uploaded “Harbor timelapse”',
			meta: '3 weeks ago',
		},
	],
	business: [
		{
			icon: plugins,
			text: 'We updated 2 plugins for you',
			meta: '1h ago · Handled by WordPress.com',
		},
		{
			icon: backup,
			text: 'Backup completed',
			meta: '1h ago',
		},
		{
			icon: people,
			text: '3 people subscribed to your newsletter',
			meta: 'Yesterday',
		},
		{
			icon: pencil,
			text: 'Published “Slow mornings in Lisbon”',
			meta: '3 days ago',
		},
		{
			icon: image,
			text: 'Uploaded 22 new photos',
			meta: '4 days ago',
		},
		{
			icon: envelope,
			text: 'Newsletter delivered to 210 subscribers',
			meta: '5 days ago',
		},
		{
			icon: comment,
			text: '9 new comments this week',
			meta: 'Last week',
		},
		{
			icon: megaphone,
			text: 'Blaze campaign reached 1,200 readers',
			meta: 'Last week',
		},
		{
			icon: shield,
			text: 'Security scan completed — no threats found',
			meta: 'Last week',
		},
		{
			icon: chartBar,
			text: 'Monthly traffic report is ready',
			meta: '2 weeks ago',
		},
	],
};

function TierPrimaryCards( {
	site,
	tier,
	spacing,
}: {
	site: Site;
	tier: BloggerTier;
	spacing: number;
} ) {
	return (
		<>
			<Grid columns={ 1 } rows={ 2 } gap={ spacing }>
				<VisibilityCard />
				<BackupCard site={ site } tier={ tier } />
			</Grid>
			<Grid columns={ 1 } rows={ 2 } gap={ spacing }>
				<ScanCard site={ site } tier={ tier } />
				<PerformanceCard site={ site } tier={ tier } />
			</Grid>
			<PlanCard site={ site } tier={ tier } />
		</>
	);
}

export default function BloggerSiteOverview( { siteSlug }: { siteSlug: string } ) {
	const isLargeViewport = useViewportMatch( 'xlarge' );
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const { setShowHelpCenter } = useHelpCenter();
	const spacing = isSmallViewport ? SPACING.SMALL : SPACING.DEFAULT;
	const mock = getMockBloggerSite( siteSlug );

	if ( ! mock ) {
		return null;
	}

	const { site, tier } = mock;
	const gridLayout = getGridLayout( { count: 4, isLargeViewport, isSmallViewport } );
	const headerFields =
		tier === 'business'
			? 'WordPress 7.0.1 · PHP 8.3 · Hosted on WordPress.com'
			: 'WordPress 7.0.1 · Hosted on WordPress.com';

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ site.name }
					description={ <Text variant="muted">{ headerFields }</Text> }
					actions={
						<Button
							__next40pxDefaultSize
							variant="primary"
							href={ site.options?.admin_url }
							icon={ wordpress }
						>
							WP Admin
						</Button>
					}
				/>
			}
		>
			<VStack alignment="stretch" spacing={ isSmallViewport ? 5 : 10 }>
				<Grid { ...gridLayout } gap={ spacing }>
					<SitePreviewColumn site={ site } tier={ tier } />
					<TierPrimaryCards site={ site } tier={ tier } spacing={ spacing } />
				</Grid>
				<Divider
					orientation="horizontal"
					style={ { color: 'var(--dashboard-overview__divider-color)' } }
				/>
				<HStack
					className={ clsx( 'site-overview-cards', 'site-overview-cards--secondary', {
						'is-large': isLargeViewport,
					} ) }
					spacing={ spacing }
					alignment="stretch"
				>
					<VStack spacing={ spacing } justify="start">
						<ActivityCard site={ site } items={ TIER_ACTIVITY[ tier ] } />
					</VStack>
					<VStack className="blogger-overview-side" spacing={ spacing } justify="start">
						<OverviewCard
							title="Support"
							icon={ help }
							heading="Need a hand?"
							description="Get instant answers from our AI assistant, or chat with a Happiness Engineer — any time."
							link="https://wordpress.com/help"
							onClick={ ( event ) => {
								event?.preventDefault();
								setShowHelpCenter( true );
							} }
							bottom={
								<div className="blogger-overview-support__columns">
									<VStack spacing={ 3 } justify="start">
										<Text weight={ 500 }>Recommended guides</Text>
										<SupportLinkList links={ SUPPORT_GUIDES } />
									</VStack>
									<VStack spacing={ 3 } justify="start" alignment="stretch">
										<Text weight={ 500 }>More resources</Text>
										<SupportLinkList links={ SUPPORT_RESOURCES } />
									</VStack>
								</div>
							}
						/>
					</VStack>
				</HStack>
				<PromoBanner site={ site } tier={ tier } />
			</VStack>
		</PageLayout>
	);
}
