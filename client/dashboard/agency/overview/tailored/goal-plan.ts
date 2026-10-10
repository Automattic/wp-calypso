/**
 * PROTOTYPE — proof of concept only.
 *
 * Turns a new agency's signup goals into a plan: one section per goal, in the
 * agency's priority order, each with a few first steps. Team size, sites
 * managed, and services fine-tune which steps show and how they're worded.
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	cloud,
	currencyDollar,
	globe,
	people,
	plugins,
	postComments,
	search,
	store,
	update,
} from '@wordpress/icons';
import type { SignupGoal, SignupProfile } from './signup-profile';

export interface TailoredPlanLinks {
	partnerDirectory: string;
	tiers: string;
	referrals: string;
	woopayments: string;
	wpcomHosting: string;
	pressableHosting: string;
	migrations: string;
	sites: string;
	team: string;
	aiMcp: string;
	/** A URL, or a callback that opens contact support in-app. */
	contactSupport: string | ( () => void );
	/** Demo video for the partner directory application. */
	directoryDemoVideo?: string;
}

export interface PlanStep {
	id: string;
	icon: JSX.Element;
	title: string;
	description: string;
	actionLabel: string;
	action: string | ( () => void );
}

export interface PlanSection {
	goal: SignupGoal;
	title: string;
	description: string;
	steps: PlanStep[];
}

const SMALLEST_BUCKET = '1-5';

/**
 * PROTOTYPE: placeholder until the partner directory demo video is published.
 * Swap in the real video URL here.
 */
export const PARTNER_DIRECTORY_DEMO_VIDEO_URL = '/library';

function getLeadsSection( links: TailoredPlanLinks, tierLevel: number ): PlanSection {
	const watchDemoStep: PlanStep = {
		id: 'watch-partner-directory-demo',
		icon: postComments,
		title: __( 'Watch how to get listed in the partner directories' ),
		description: __(
			'A short demo of the directory application, so you’re ready the moment it unlocks.'
		),
		actionLabel: __( 'Watch the demo' ),
		action: links.directoryDemoVideo ?? PARTNER_DIRECTORY_DEMO_VIDEO_URL,
	};

	// Account activated: the directories open at Agency Partner, so that comes first.
	if ( tierLevel < 1 ) {
		return {
			goal: 'more_leads',
			title: __( 'Get more clients' ),
			description: __(
				'Partner directory listings unlock at Agency Partner, and qualified leads unlock at Pro Partner. Here’s how to get there.'
			),
			steps: [
				{
					id: 'reach-agency-partner',
					icon: globe,
					title: __( 'Reach the Agency Partner tier' ),
					description: __(
						'The partner directories open at $1,200 in influenced revenue. Referrals, hosting, and WooPayments all count.'
					),
					actionLabel: __( 'View tiers' ),
					action: links.tiers,
				},
				watchDemoStep,
			],
		};
	}

	const steps: PlanStep[] = [
		{
			id: 'apply-partner-directory',
			icon: search,
			title: __( 'Apply to the partner directories' ),
			description: __(
				'Tell us about your expertise so we can list you on WordPress.com, Woo, Jetpack, and Pressable.'
			),
			actionLabel: __( 'Apply' ),
			action: links.partnerDirectory,
		},
		watchDemoStep,
	];
	if ( tierLevel < 2 ) {
		steps.push( {
			id: 'reach-pro-partner',
			icon: globe,
			title: __( 'Reach Pro Partner for qualified leads' ),
			description: __(
				'Automattic sends qualified client leads to partners at $5,000 in influenced revenue.'
			),
			actionLabel: __( 'View tiers' ),
			action: links.tiers,
		} );
	}

	return {
		goal: 'more_leads',
		title: __( 'Get more clients' ),
		description: __(
			'Businesses use the Automattic partner directories to find agencies, and qualified leads go to listed partners.'
		),
		steps,
	};
}

function getIncomeSection( profile: SignupProfile, links: TailoredPlanLinks ): PlanSection {
	const buildsStores = profile.servicesOffered.includes( 'ecommerce_development' );
	const referStep: PlanStep = {
		id: 'refer-first-client',
		icon: globe,
		title: __( 'Refer your first client' ),
		description: __(
			'Earn up to 50% recurring commission when clients buy products and hosting through your referral.'
		),
		actionLabel: __( 'Refer' ),
		action: links.referrals,
	};
	const wooPaymentsStep: PlanStep = {
		id: 'set-up-woopayments',
		icon: currencyDollar,
		title: __( 'Set up WooPayments on client stores' ),
		description: buildsStores
			? __(
					'Since you build online stores, WooPayments lets you earn on the payment volume of every store you launch.'
				)
			: __( 'Earn commission on the payment volume across your clients’ online stores.' ),
		actionLabel: __( 'Set up' ),
		action: links.woopayments,
	};

	return {
		goal: 'passive_income',
		title: __( 'Earn recurring revenue' ),
		description: __(
			'Commissions on referrals and payments keep paying out for as long as your clients stay.'
		),
		steps: buildsStores ? [ wooPaymentsStep, referStep ] : [ referStep, wooPaymentsStep ],
	};
}

function getHostingSection( profile: SignupProfile, links: TailoredPlanLinks ): PlanSection {
	const isSmallPortfolio = profile.managedSites === SMALLEST_BUCKET;
	let hostingDescription: string = __(
		'WordPress.com keeps each client site simple to run, at an agency price.'
	);
	if ( ! isSmallPortfolio ) {
		hostingDescription = profile.managedSites
			? sprintf(
					/* translators: %s is a range of sites, e.g. 21-50 */
					__( 'With %s sites to manage, Pressable lets you host them all from one account.' ),
					profile.managedSites
				)
			: __( 'Pressable lets you host all of your client sites from one account.' );
	}

	return {
		goal: 'better_hosting',
		title: __( 'Move your clients to better hosting' ),
		description: __(
			'Agency pricing, reliable uptime, and free migrations come with every Automattic hosting plan.'
		),
		steps: [
			{
				id: 'compare-hosting',
				icon: cloud,
				title: isSmallPortfolio
					? __( 'Start with WordPress.com hosting' )
					: __( 'Start with Pressable hosting' ),
				description: hostingDescription,
				actionLabel: __( 'Compare plans' ),
				action: isSmallPortfolio ? links.wpcomHosting : links.pressableHosting,
			},
			{
				id: 'request-migration',
				icon: update,
				title: __( 'Migrate existing client sites for free' ),
				description: __(
					'Our team moves your sites for you, and you can earn a commission on each one you migrate.'
				),
				actionLabel: __( 'Start a migration' ),
				action: links.migrations,
			},
		],
	};
}

function getOperationsSection( profile: SignupProfile, links: TailoredPlanLinks ): PlanSection {
	const hasTeam = !! profile.agencySize && profile.agencySize !== SMALLEST_BUCKET;
	const steps: PlanStep[] = [
		{
			id: 'connect-sites',
			icon: plugins,
			title: __( 'Bring your client sites into one dashboard' ),
			description: __(
				'Monitor uptime, backups, and plugin updates across every site you manage from one place.'
			),
			actionLabel: __( 'Add sites' ),
			action: links.sites,
		},
		{
			id: 'connect-ai',
			icon: postComments,
			title: __( 'Connect Automattic for Agencies to your AI tools' ),
			description: __(
				'Use our MCP server to check sites, licenses, and billing from the AI assistant you already use.'
			),
			actionLabel: __( 'Connect' ),
			action: links.aiMcp,
		},
	];

	if ( hasTeam ) {
		steps.push( {
			id: 'invite-team',
			icon: people,
			title: __( 'Invite your team' ),
			description: sprintf(
				/* translators: %s is a range of people, e.g. 6-10 */
				__( 'Give your %s-person team access so everyone works from the same dashboard.' ),
				profile.agencySize
			),
			actionLabel: __( 'Invite' ),
			action: links.team,
		} );
	}

	return {
		goal: 'optimize_operations',
		title: __( 'Run your agency more efficiently' ),
		description: __(
			'These tools take repetitive site work off your plate so your team can spend more time on clients.'
		),
		steps,
	};
}

function getOtherSection( profile: SignupProfile, links: TailoredPlanLinks ): PlanSection {
	return {
		goal: 'other',
		title: __( 'Something else you need' ),
		description: profile.otherGoal
			? sprintf(
					/* translators: %s is what the agency wrote when signing up */
					__( 'You told us: “%s”' ),
					profile.otherGoal
				)
			: __( 'You told us you need help with something we didn’t list.' ),
		steps: [
			{
				id: 'talk-to-us',
				icon: store,
				title: __( 'Talk to our team' ),
				description: __(
					'Tell us more about what you need, and we’ll point you to the right part of the program.'
				),
				actionLabel: __( 'Contact us' ),
				action: links.contactSupport,
			},
		],
	};
}

export function getTailoredPlan(
	profile: SignupProfile,
	links: TailoredPlanLinks,
	tierLevel = 0
): PlanSection[] {
	return profile.goals.map( ( goal ) => {
		switch ( goal ) {
			case 'more_leads':
				return getLeadsSection( links, tierLevel );
			case 'passive_income':
				return getIncomeSection( profile, links );
			case 'better_hosting':
				return getHostingSection( profile, links );
			case 'optimize_operations':
				return getOperationsSection( profile, links );
			case 'other':
				return getOtherSection( profile, links );
		}
	} );
}
