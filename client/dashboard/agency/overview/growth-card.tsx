import { formatCurrency } from '@automattic/number-formatters';
import { Button, Icon } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import {
	chartBar,
	currencyDollar,
	globe,
	help,
	payment,
	people,
	store,
	trendingUp,
} from '@wordpress/icons';
import { Fragment } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody, CardDivider, CardHeader } from '../../components/card';
import { IconListItem } from '../../components/icon-list/icon-list-item';
import { SectionHeader } from '../../components/section-header';
import { TARGET_INFLUENCED_REVENUE } from '../tiers/constants';
import getCurrentAgencyTier from '../tiers/get-current-agency-tier';
import { PARTNER_PROGRAM_GUIDE_URL, PROGRAM_INCENTIVES_URL } from './constants';
import NewTabLabel from './new-tab-label';
import OverviewLinkButton from './overview-link-button';
import useWooPaymentsStoreCount from './use-woopayments-store-count';
import type { AgencyOverviewLinks } from './overview-content';
import type { AgencyTierType, RecordTracksEvent } from '../tiers/types';
import type { AgencyCapability } from '@automattic/api-core';

type GrowthCardLinks = Pick<
	AgencyOverviewLinks,
	'tiers' | 'sites' | 'referrals' | 'woopayments' | 'marketplace' | 'partnerDirectory'
>;

// The marketplace destination differs per host (products on the classic app,
// exclusive offers on the dashboard), so either capability unlocks those rows.
// TODO: drop 'a4a_read_exclusive_offers' once the MSD dashboard has a real
// marketplace screen and its overview links there instead of exclusive offers.
const MARKETPLACE_CAPABILITIES: AgencyCapability[] = [
	'a4a_read_marketplace',
	'a4a_read_exclusive_offers',
];

interface GrowthItem {
	id: string;
	icon: JSX.Element;
	title: string;
	description: string;
	actionLabel: string;
	href: string;
	isExternal?: boolean;
	/** Capabilities that can act on the row (any of them); rows without one are visible to everyone. */
	requiredCapability?: AgencyCapability | AgencyCapability[];
}

interface GrowthContent {
	title: string;
	description?: string;
	items: GrowthItem[];
}

interface GrowthCardProps {
	agencyId: number;
	/** Shows the “While you wait” variant for accounts still under review. */
	isPending?: boolean;
	/** Disables the WooPayments store lookup for users without earnings access. */
	canAccessEarnings?: boolean;
	/** The current user's agency capabilities; rows the user can't act on are hidden. */
	capabilities?: string[];
	/** Swaps Premier’s “get listed” move for moving more sites once the agency has an approved listing. */
	hasPartnerDirectoryListing?: boolean;
	tierId?: AgencyTierType;
	influencedRevenue: number;
	links: GrowthCardLinks;
	shouldUseRouterLink?: boolean;
	recordTracksEvent?: RecordTracksEvent;
}

/**
 * Replaces the “set up WooPayments” move once the agency already has
 * WooPayments stores — the next best move then is growing IAR itself.
 */
function getGrowRevenueItem(
	target: number,
	influencedRevenue: number,
	links: GrowthCardLinks
): GrowthItem {
	return {
		id: 'grow-influenced-revenue',
		icon: trendingUp,
		title: sprintf(
			/* translators: %s is the influenced revenue target, e.g. $250,000 */
			__( 'Grow influenced revenue to %s' ),
			formatCurrency( target, 'USD', { stripZeros: true } )
		),
		description: sprintf(
			/* translators: %s is the remaining influenced revenue to reach the target, e.g. $171,600 */
			__( '%s to go — move client sites to Automattic hosting & set up WooPayments' ),
			formatCurrency( Math.max( target - influencedRevenue, 0 ), 'USD', { stripZeros: true } )
		),
		actionLabel: __( 'Review' ),
		href: links.tiers,
		requiredCapability: 'a4a_read_agency_tier',
	};
}

function getPendingContent( links: GrowthCardLinks ): GrowthContent {
	return {
		title: __( 'While you wait' ),
		items: [
			{
				id: 'program-guide',
				icon: help,
				title: __( 'Read the partner program guide' ),
				description: __( 'Learn how tiers, IAR and benefits work' ),
				actionLabel: __( 'Read' ),
				href: PARTNER_PROGRAM_GUIDE_URL,
				isExternal: true,
			},
			{
				id: 'explore-marketplace',
				icon: store,
				title: __( 'Explore the Marketplace' ),
				description: __( 'Browse 60+ products you’ll be able to resell' ),
				actionLabel: __( 'Explore' ),
				href: links.marketplace,
				requiredCapability: MARKETPLACE_CAPABILITIES,
			},
		],
	};
}

function getEmergingContent( links: GrowthCardLinks ): GrowthContent {
	return {
		title: __( 'Grow toward Agency Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue target, e.g. $1,200 */
			__(
				'Reach %s to become an Agency Partner — unlocks directory listings and a partner badge.'
			),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'agency-partner' ], 'USD', { stripZeros: true } )
		),
		items: [
			{
				id: 'refer-hosting',
				icon: globe,
				title: __( 'Refer sites' ),
				description: __( 'Client spend counts toward IAR · you earn 20% recurring' ),
				actionLabel: __( 'Refer' ),
				href: links.referrals,
				requiredCapability: 'a4a_read_referrals',
			},
			{
				id: 'refer-products',
				icon: currencyDollar,
				title: __( 'Refer products' ),
				description: __( 'Counts toward IAR · 50% recurring on renewals' ),
				actionLabel: __( 'Refer' ),
				href: links.marketplace,
				requiredCapability: MARKETPLACE_CAPABILITIES,
			},
			{
				id: 'browse-marketplace',
				icon: store,
				title: __( 'Buy & resell from the Marketplace' ),
				description: __( '60+ products at up to 80% off — purchases count toward IAR' ),
				actionLabel: __( 'Browse' ),
				href: links.marketplace,
				requiredCapability: MARKETPLACE_CAPABILITIES,
			},
		],
	};
}

function getAgencyContent( links: GrowthCardLinks ): GrowthContent {
	return {
		title: __( 'Grow toward Pro Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue target, e.g. $5,000 */
			__(
				'Reach %s to become a Pro Partner — unlocks free agency hosting, a dedicated Partner Manager, and priority support.'
			),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'pro-agency-partner' ], 'USD', {
				stripZeros: true,
			} )
		),
		items: [
			{
				id: 'refer-hosting',
				icon: globe,
				title: __( 'Refer more sites' ),
				description: __( 'Client spend counts toward IAR · you earn 20% recurring' ),
				actionLabel: __( 'Refer' ),
				href: links.referrals,
				requiredCapability: 'a4a_read_referrals',
			},
			{
				id: 'set-up-woopayments',
				icon: currencyDollar,
				title: __( 'Set up WooPayments for clients' ),
				description: __( '$1 of IAR for every $100 in sales · earn 0.05% TPV' ),
				actionLabel: __( 'Set up' ),
				href: links.woopayments,
				requiredCapability: 'a4a_read_referrals',
			},
			{
				id: 'refer-products',
				icon: store,
				title: __( 'Refer products' ),
				description: __( 'Counts toward IAR · 50% recurring on renewals' ),
				actionLabel: __( 'Refer' ),
				href: links.marketplace,
				requiredCapability: MARKETPLACE_CAPABILITIES,
			},
		],
	};
}

function getProContent(
	links: GrowthCardLinks,
	influencedRevenue: number,
	hasWooPaymentsStores?: boolean
): GrowthContent {
	// While the store count loads, hold the row rather than flashing the wrong one.
	let wooPaymentsItem: GrowthItem | null = null;
	if ( hasWooPaymentsStores === true ) {
		wooPaymentsItem = getGrowRevenueItem(
			TARGET_INFLUENCED_REVENUE[ 'premier-partner' ],
			influencedRevenue,
			links
		);
	} else if ( hasWooPaymentsStores === false ) {
		wooPaymentsItem = {
			id: 'set-up-woopayments',
			icon: payment,
			title: __( 'Set up WooPayments for clients' ),
			description: __( '$1 of IAR for every $100 in sales · earn 0.05% TPV' ),
			actionLabel: __( 'Set up' ),
			href: links.woopayments,
			requiredCapability: 'a4a_read_referrals',
		};
	}

	return {
		title: __( 'Grow toward Premier Partner' ),
		description: __(
			'The Premier Partner tier unlocks Marketing Development Funds and a Parse.ly trial. It takes more than revenue.'
		),
		items: [
			...( wooPaymentsItem ? [ wooPaymentsItem ] : [] ),
			{
				id: 'enterprise-projects',
				icon: chartBar,
				title: __( 'Deliver 3 enterprise-scale projects' ),
				description: __( 'Or onboard 3 shared anchor customers' ),
				actionLabel: __( 'Learn more' ),
				href: PROGRAM_INCENTIVES_URL,
				isExternal: true,
			},
			{
				id: 'certify-developers',
				icon: people,
				title: __( 'Certify 30% of your developers' ),
				description: __( 'Across Automattic certifications' ),
				actionLabel: __( 'Start' ),
				href: PROGRAM_INCENTIVES_URL,
				isExternal: true,
			},
		],
	};
}

function getPremierContent(
	links: GrowthCardLinks,
	hasPartnerDirectoryListing?: boolean
): GrowthContent {
	return {
		title: __( 'Get the most from Premier' ),
		description: __(
			'You’re a Premier Partner — make sure you’re getting leads and using every benefit.'
		),
		items: [
			hasPartnerDirectoryListing
				? {
						id: 'move-client-sites',
						icon: globe,
						title: __( 'Move sites to Automattic hosting' ),
						description: __( '20% recurring on every renewal · grows IAR' ),
						actionLabel: __( 'Review sites' ),
						href: links.sites,
						requiredCapability: 'a4a_read_managed_sites',
				  }
				: {
						id: 'partner-directory',
						icon: globe,
						title: __( 'Get listed in the Partner Directory' ),
						description: __(
							'Receive vetted leads across WordPress.com, Woo, Jetpack & Pressable'
						),
						actionLabel: __( 'Set up listing' ),
						href: links.partnerDirectory,
						requiredCapability: 'a4a_read_partner_directory',
				  },
			{
				id: 'set-up-woopayments',
				icon: payment,
				title: __( 'Set up WooPayments on more stores' ),
				description: __( '$1 IAR per $100 in sales' ),
				actionLabel: __( 'Set up' ),
				href: links.woopayments,
				requiredCapability: 'a4a_read_referrals',
			},
			{
				id: 'marketing-development-funds',
				icon: currencyDollar,
				title: __( 'Use your Marketing Development Funds' ),
				description: __( 'Premier benefit — co-fund campaigns' ),
				actionLabel: __( 'Learn more' ),
				href: PROGRAM_INCENTIVES_URL,
				isExternal: true,
			},
		],
	};
}

function getContent(
	isPending: boolean,
	tierLevel: number,
	links: GrowthCardLinks,
	influencedRevenue: number,
	hasWooPaymentsStores?: boolean,
	hasPartnerDirectoryListing?: boolean
): GrowthContent {
	if ( isPending ) {
		return getPendingContent( links );
	}
	if ( tierLevel >= 4 ) {
		return getPremierContent( links, hasPartnerDirectoryListing );
	}
	if ( tierLevel >= 2 ) {
		return getProContent( links, influencedRevenue, hasWooPaymentsStores );
	}
	if ( tierLevel >= 1 ) {
		return getAgencyContent( links );
	}
	return getEmergingContent( links );
}

function GrowthItemIcon( { icon }: { icon: JSX.Element } ) {
	return (
		<div
			aria-hidden="true"
			style={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexShrink: 0,
				width: '48px',
				height: '48px',
				borderRadius: '4px',
				background: 'var(--color-gray-100)',
				color: 'var(--color-gray-700)',
			} }
		>
			<Icon icon={ icon } size={ 28 } />
		</div>
	);
}

/**
 * The “grow toward the next tier” module of the Overview screen. Its goal and
 * actions adapt to the agency’s account state: pending accounts get a “while
 * you wait” list, each tier points at the moves that unlock the next one, and
 * Premier (top tier) shifts to getting the most out of its benefits.
 */
export default function GrowthCard( {
	agencyId,
	isPending,
	canAccessEarnings = true,
	capabilities,
	hasPartnerDirectoryListing,
	tierId,
	influencedRevenue,
	links,
	shouldUseRouterLink,
	recordTracksEvent,
}: GrowthCardProps ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const tier = getCurrentAgencyTier( tierId );
	const tierLevel = tier?.level ?? 0;
	// Only the Pro/VIP content swaps a row on the store count, so don't fire the
	// lookup for other tiers.
	const needsStoreCount = ! isPending && canAccessEarnings && tierLevel >= 2 && tierLevel < 4;
	const { storeCount, isLoading: isLoadingStoreCount } = useWooPaymentsStoreCount(
		agencyId,
		needsStoreCount
	);
	// undefined = still loading; getProContent holds the row until it resolves.
	let hasWooPaymentsStores: boolean | undefined = false;
	if ( needsStoreCount ) {
		hasWooPaymentsStores = isLoadingStoreCount ? undefined : storeCount > 0;
	}
	const content = getContent(
		!! isPending,
		tierLevel,
		links,
		influencedRevenue,
		hasWooPaymentsStores,
		hasPartnerDirectoryListing
	);

	// Rows the user can't act on would only bounce off the route guards.
	const canActOn = ( item: GrowthItem ) => {
		if ( ! item.requiredCapability || ! capabilities ) {
			return true;
		}
		const required = Array.isArray( item.requiredCapability )
			? item.requiredCapability
			: [ item.requiredCapability ];
		return required.some( ( capability ) => capabilities.includes( capability ) );
	};
	const items = content.items.filter( canActOn );

	if ( ! items.length ) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<SectionHeader level={ 3 } title={ content.title } description={ content.description } />
			</CardHeader>
			{ items.map( ( item, index ) => {
				const handleClick = () =>
					recordTracksEvent?.( 'calypso_a4a_overview_growth_action_click', {
						action_id: item.id,
						// Pending accounts have no tier yet, so don't report the default one.
						agency_tier: isPending ? undefined : tier?.id,
					} );

				return (
					<Fragment key={ item.id }>
						{ index > 0 && <CardDivider style={ { borderColor: 'var(--color-gray-100)' } } /> }
						<CardBody>
							<IconListItem
								title={ item.title }
								description={ item.description }
								decoration={ ! isSmallViewport && <GrowthItemIcon icon={ item.icon } /> }
								layout={ isSmallViewport ? 'stacked' : 'inline' }
								suffix={
									<ButtonStack
										justify={ isSmallViewport ? 'flex-start' : 'flex-end' }
										expanded={ isSmallViewport }
										style={ { flexShrink: 0 } }
										as="span"
									>
										{ item.isExternal ? (
											<Button
												size="compact"
												variant="secondary"
												href={ item.href }
												target="_blank"
												rel="noreferrer"
												onClick={ handleClick }
											>
												<NewTabLabel>{ item.actionLabel }</NewTabLabel>
											</Button>
										) : (
											<OverviewLinkButton
												size="compact"
												variant="secondary"
												href={ item.href }
												shouldUseRouterLink={ shouldUseRouterLink }
												onClick={ handleClick }
											>
												{ item.actionLabel }
											</OverviewLinkButton>
										) }
									</ButtonStack>
								}
							/>
						</CardBody>
					</Fragment>
				);
			} ) }
		</Card>
	);
}
