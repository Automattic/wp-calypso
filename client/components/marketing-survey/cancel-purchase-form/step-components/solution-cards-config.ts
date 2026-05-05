import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { ReactElement } from 'react';

const BUILT_BY_URL = 'https://wordpress.com/website-design-service/?ref=wpcom-cancel-flow';
const RENEW_COUPON = 'DONTGO25';
const SUPPORT_URL = localizeUrl( 'https://wordpress.com/support/' );
const SITE_SPEED_URL = localizeUrl( 'https://wordpress.com/support/site-speed/' );
const SITE_MIGRATION_URL = localizeUrl( 'https://wordpress.com/support/site-migration/' );
const DOMAINS_SUPPORT_URL = localizeUrl( 'https://wordpress.com/support/domains/' );

function getLiveChatUrlForPlans( site: SiteDetails, purchase: Purchase ): string {
	return `/purchases/subscriptions/${ site.slug }/${ purchase.id }`;
}

export type CardActionContext = {
	site: SiteDetails;
	purchase: Purchase;
	closeDialog: () => void;
	changePlanUrl: string;
	renewNowUrl: string;
	cancellationReason: string;
	onClickDowngrade?: ( upsell: string ) => void;
	onSelectSwitchToMonthly?: () => void;
	setNewMessagingChat: ( config: {
		initialMessage: string;
		section: string;
		siteUrl: string;
		siteId: number;
	} ) => void;
	setOpenOdieWithContext: ( config: {
		initialMessage: string;
		section: string;
		siteUrl: string;
		siteId: number;
	} ) => void;
};

export type SolutionCardConfigEntry = {
	id: string;
	/** Literal string for translate() - i18n */
	title: string;
	/** Optional literal for translate() - maps to SummaryButton description */
	subtitle?: string;
	/** Optional icon/decoration - maps to SummaryButton decoration */
	decoration?: ReactElement;
	getHref?: ( ctx: CardActionContext ) => string | undefined;
	onClick?: ( ctx: CardActionContext ) => void;
};

export const SOLUTION_CARD_CONFIG: SolutionCardConfigEntry[] = [
	{
		id: 'change-plan',
		title: 'Switch to a different plan',
		subtitle: 'You can change to a plan with the features and pricing that work for you.',
		getHref: ( ctx ) => ctx.changePlanUrl,
		onClick: ( ctx ) => {
			page( ctx.changePlanUrl );
			ctx.closeDialog();
		},
	},
	{
		id: 'renew-now-pay-less',
		title: 'Renew now and pay less',
		subtitle: 'Get an exclusive 25% discount automatically applied at checkout.',
		getHref: ( ctx ) => ctx.renewNowUrl,
		onClick: ( ctx ) => {
			page( ctx.renewNowUrl );
			ctx.closeDialog();
		},
	},
	{
		id: 'switch-to-monthly',
		title: 'Switch to monthly payments',
		subtitle: 'Keep things flexible with monthly billing.',
		onClick: ( ctx ) => {
			ctx.onSelectSwitchToMonthly?.();
		},
	},
	{
		id: 'speak-with-support',
		title: 'Speak with our support team',
		subtitle: "We're here to answer any of your questions.",
		onClick: ( ctx ) => {
			page( getLiveChatUrlForPlans( ctx.site, ctx.purchase ) );
			ctx.setNewMessagingChat( {
				initialMessage:
					"User is contacting us from pre-cancellation form. Cancellation reason they've given: " +
					ctx.cancellationReason,
				section: 'pre-cancellation-upsell',
				siteUrl: ctx.site.URL,
				siteId: ctx.site.ID,
			} );
			ctx.closeDialog();
		},
	},
	{
		id: 'built-by',
		title: 'Let us build for you',
		subtitle: 'Our team can build your site so you can focus on what matters.',
		getHref: () => BUILT_BY_URL,
		onClick: () => {
			window.location.replace( BUILT_BY_URL );
		},
	},
	{
		id: 'ask-ai-assistant',
		title: 'Ask our AI assistant',
		subtitle: 'Use our AI assistant to quickly find solutions.',
		onClick: ( ctx ) => {
			ctx.setOpenOdieWithContext( {
				initialMessage:
					"User is contacting from pre-cancellation form. Cancellation reason they've given: " +
					ctx.cancellationReason,
				section: 'pre-cancellation-upsell',
				siteUrl: ctx.site.URL,
				siteId: ctx.site.ID,
			} );
			ctx.closeDialog();
		},
	},
	{
		id: 'upgrade-for-full-access',
		title: 'Pick another paid plan for access to more features',
		subtitle: 'Get the business plan to access all available plugins and themes.',
		getHref: ( ctx ) => ctx.changePlanUrl,
		onClick: ( ctx ) => {
			page( ctx.changePlanUrl );
			ctx.closeDialog();
		},
	},
	{
		id: 'get-theme-addon',
		title: 'Change your plan',
		subtitle: 'Unlock premium themes on another plan.',
		getHref: ( ctx ) => `/plans/${ ctx.site.slug }`,
		onClick: ( ctx ) => {
			page( `/plans/${ ctx.site.slug }` );
			ctx.closeDialog();
		},
	},
	{
		id: 'find-guides',
		title: 'Find easy step-by-step guides',
		subtitle: 'Browse our guides and get back on track quickly.',
		getHref: () => SUPPORT_URL,
		onClick: () => {
			window.open( SUPPORT_URL, '_blank' );
		},
	},
	{
		id: 'make-site-faster',
		title: 'Make your site faster',
		subtitle: 'Run our free speed test and get personalized recommendations.',
		getHref: () => SITE_SPEED_URL,
		onClick: () => {
			window.open( SITE_SPEED_URL, '_blank' );
		},
	},
	{
		id: 'use-migration-tools',
		title: 'Use our migration tools',
		subtitle: 'Expert assistance or seamless importers for quick moves.',
		getHref: () => SITE_MIGRATION_URL,
		onClick: () => {
			window.open( SITE_MIGRATION_URL, '_blank' );
		},
	},
	{
		id: 'use-domain-guide',
		title: 'Use our domain guide',
		subtitle: 'Follow our simple guide to get connected quickly.',
		getHref: () => DOMAINS_SUPPORT_URL,
		onClick: () => {
			window.open( DOMAINS_SUPPORT_URL, '_blank' );
		},
	},
	{
		id: 'explore-domain-options',
		title: 'Explore more domain options',
		subtitle: "Our search tool finds great alternatives you'll love.",
		getHref: ( ctx ) => `/domains/add/${ ctx.site.slug }`,
		onClick: ( ctx ) => {
			page( `/domains/add/${ ctx.site.slug }` );
			ctx.closeDialog();
		},
	},
];

export { BUILT_BY_URL, RENEW_COUPON, getLiveChatUrlForPlans };
