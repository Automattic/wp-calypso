import { getWooEmergencyTags, normalizeStoreUrl, WOO_CORE_PRODUCT_SLUG } from './woo-handoff';
import type { HumanRoutingFlags, HumanSupportQuestionType } from './types';
import type { WooHandoffProduct, WooHandoffStore } from './woo-handoff';
import type { Message } from '@automattic/odie-client';

/** The support form's categories, which set the ticket's Zendesk fields and subject prefix. */
export type WooTicketHelpCategory =
	'broken' | 'before-buy' | 'start-scale-store' | 'account' | 'vendor';

/** The body of WooCommerce.com's `POST /wccom/support-form/create-ticket`, as the support form sends it. */
export type WooTicketRequest = {
	subject: string;
	message: string;
	helpCategory: WooTicketHelpCategory;
	productSlug?: string;
	websiteOption?: 'connected-site' | 'manual-site';
	websiteURL?: string;
	connectedSiteID?: number;
	isSiteOffline?: boolean;
	/** Lets a technical ticket through without a System Status Report, tagged `woo_ssr_unavailable`. */
	isSsrUnavailable?: boolean;
	tags: string[];
	aiChatId?: number;
};

export type WooTicketPlan = {
	request: WooTicketRequest;
	/**
	 * Set when the ticket should carry the connected store's System Status Report: refresh it with
	 * `get-ssr` first, and send `fallback` instead if the refresh fails.
	 */
	ssr: { siteId: number; fallback: WooTicketRequest } | null;
};

/** The Woo preset gives the Help Center's chats this Zendesk tag. Tickets don't get it, so it's added here. */
export const WOO_HELP_CENTER_TAG = 'woo_support_flow_help_center';

const HELP_CATEGORIES: Record< HumanSupportQuestionType, WooTicketHelpCategory > = {
	'technical-support': 'broken',
	'pre-sales': 'before-buy',
	'start-scale-store': 'start-scale-store',
	account: 'account',
	'marketplace-vendor': 'vendor',
};

const SUBJECT_LENGTH = 100;
const TRANSCRIPT_LENGTH = 8000;

/** Without a question, the bot's flags sent the request here, and an unknown charge is an account matter. */
export const getWooTicketHelpCategory = (
	question: HumanSupportQuestionType | null
): WooTicketHelpCategory => ( question ? HELP_CATEGORIES[ question ] : 'account' );

// Messages loaded from the AI chat's history have no `type`. Only those sent from the page do.
const getText = ( message: Message ) =>
	( ! message.type || message.type === 'message' ) && typeof message.content === 'string'
		? message.content.trim()
		: '';

const truncate = ( text: string, length: number ) =>
	text.length > length ? `${ text.slice( 0, length - 1 ).trimEnd() }…` : text;

function getSubject( messages: Message[] ) {
	const first = messages.find( ( message ) => message.role === 'user' && getText( message ) );

	return first
		? truncate( getText( first ).replace( /\s+/g, ' ' ), SUBJECT_LENGTH )
		: 'Help Center request';
}

function getMessage( {
	messages,
	odieId,
	storeUrl,
	note,
}: {
	messages: Message[];
	odieId: number | null;
	storeUrl: string | null;
	note: string | null;
} ) {
	const header = [
		'Sent from the Help Center on WooCommerce.com, after a chat with the AI assistant.',
		odieId ? `AI chat: ${ odieId }` : null,
		storeUrl ? `Store: ${ storeUrl }` : null,
		note,
	].filter( Boolean );

	const transcript = messages
		.filter( getText )
		.map(
			( message ) => `${ message.role === 'user' ? 'Merchant' : 'AI' }: ${ getText( message ) }`
		)
		.join( '\n\n' );

	// The end of the chat is where the merchant asked for a person, so keep that part.
	const cappedTranscript =
		transcript.length > TRANSCRIPT_LENGTH
			? `…${ transcript.slice( -TRANSCRIPT_LENGTH ) }`
			: transcript;

	return [ header.join( '\n' ), cappedTranscript ].filter( Boolean ).join( '\n\n---\n\n' );
}

/**
 * How the ticket names the store, and whether it carries the store's System Status Report, as the
 * support form decides. A vendor's ticket goes to the vendor by email, so it never refreshes or
 * attaches the SSR.
 */
function getWebsite( {
	helpCategory,
	store,
	url,
	product,
	isSiteDown,
}: {
	helpCategory: WooTicketHelpCategory;
	store: WooHandoffStore | null;
	url: string | null;
	product: WooHandoffProduct | null;
	isSiteDown: boolean;
} ): {
	fields: Partial< WooTicketRequest >;
	ssr: { siteId: number; fields: Partial< WooTicketRequest > } | null;
} {
	if ( ! url || ( helpCategory !== 'broken' && helpCategory !== 'before-buy' ) ) {
		return { fields: {}, ssr: null };
	}

	if ( helpCategory === 'before-buy' ) {
		return { fields: { websiteOption: 'manual-site', websiteURL: url }, ssr: null };
	}

	const manual: Partial< WooTicketRequest > = {
		websiteOption: 'manual-site',
		websiteURL: url,
		...( isSiteDown ? { isSiteOffline: true } : { isSsrUnavailable: true } ),
	};

	if ( isSiteDown || ! store?.id || product?.supportType === 'third_party' ) {
		return { fields: manual, ssr: null };
	}

	return {
		fields: { websiteOption: 'connected-site', connectedSiteID: store.id, websiteURL: url },
		ssr: { siteId: store.id, fields: manual },
	};
}

/**
 * The ticket for a request the who-gets-a-human table sends to a ticket or a vendor (WOOPUBR-2404),
 * built from the merchant's answers, the bot's flags and the AI chat.
 */
export function getWooTicketPlan( {
	question,
	product,
	store,
	storeUrl,
	flags,
	chat,
	hasMerchantData,
}: {
	question: HumanSupportQuestionType | null;
	product: WooHandoffProduct | null;
	/** The connected store the merchant picked, if they picked one. */
	store: WooHandoffStore | null;
	/** The picked store's URL, or the address typed for another site. */
	storeUrl: string | null;
	flags: HumanRoutingFlags;
	chat: { odieId?: number | null; messages: Message[] };
	hasMerchantData: boolean;
} ): WooTicketPlan {
	const helpCategory = getWooTicketHelpCategory( question );
	const url = storeUrl ? normalizeStoreUrl( storeUrl ) : null;
	// Without the merchant's product list there's nothing to pick, so technical support goes to Core.
	const isCoreFallback = helpCategory === 'broken' && ! product;
	const website = getWebsite( {
		helpCategory,
		store,
		url,
		product,
		isSiteDown: flags.isEmergency && flags.emergencyType === 'site_down',
	} );

	const common: WooTicketRequest = {
		subject: getSubject( chat.messages ),
		message: getMessage( {
			messages: chat.messages,
			odieId: chat.odieId ?? null,
			storeUrl: url,
			note:
				isCoreFallback && ! hasMerchantData
					? "WooCommerce.com didn't send the merchant's products, so this ticket is filed under WooCommerce Core."
					: null,
		} ),
		helpCategory,
		...( helpCategory === 'broken' && {
			productSlug: product?.slug ?? WOO_CORE_PRODUCT_SLUG,
		} ),
		tags: [ WOO_HELP_CENTER_TAG, ...getWooEmergencyTags( flags ) ],
		...( chat.odieId && { aiChatId: chat.odieId } ),
	};

	return {
		request: { ...common, ...website.fields },
		ssr: website.ssr && {
			siteId: website.ssr.siteId,
			fallback: { ...common, ...website.ssr.fields },
		},
	};
}
