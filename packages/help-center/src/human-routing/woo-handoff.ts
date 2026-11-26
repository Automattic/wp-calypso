import { ZENDESK_CUSTOM_FIELD_PRODUCT } from '@automattic/zendesk-client';
import type {
	HumanRoutingFlags,
	HumanRoutingInput,
	HumanSupportQuestionType,
	ProductSupportType,
	SupportTier,
} from './types';
import type { HumanSupportChatValues } from '@automattic/odie-client';

/** The synthetic product the support form uses for WooCommerce Core itself. */
export const WOO_CORE_PRODUCT_SLUG = 'wc-core';

export type WooHandoffStore = {
	url: string;
	domain: string;
	/**
	 * The store's connection ID on WooCommerce.com, which `get-ssr` and a `connected-site` ticket
	 * take. WooCommerce.com sends it from 26926-gh-Automattic/woocommerce.com on.
	 */
	id?: number;
};

export type WooHandoffProduct = {
	slug: string;
	name: string;
	supportType: ProductSupportType;
	isRevShare: boolean;
	/** Where an externally supported product takes support requests. */
	externalSupportUrl?: string | null;
	/** The value of Zendesk's Product field for this product, as the support form sends it. */
	zendeskSlug?: string | null;
};

/**
 * What WooCommerce.com tells the Help Center about the signed-in merchant, from
 * `GET /wccom/help-center/v1/handoff`, so it can ask the right questions and route the request.
 */
export type WooHandoffData = {
	/** Null when WooCommerce.com couldn't work out the tier. Target customers come back as Tier 1. */
	supportTier: SupportTier | null;
	isPaying: boolean;
	isWooEnterpriseCustomer: boolean;
	connectedStores: WooHandoffStore[];
	supportedProducts: WooHandoffProduct[];
	/** Marketplace vendors can ask vendor questions. */
	isVendor: boolean;
};

export type WooHandoffAnswers = {
	question: HumanSupportQuestionType;
	productSlug: string | null;
	/** A connected store's URL, or the address typed for another site. */
	storeUrl: string | null;
};

/**
 * Only technical support asks for a product, and needs one. Pre-sales doesn't ask in milestone 1,
 * since the merchant can only pick products they already have.
 */
export const isProductAsked = ( question: HumanSupportQuestionType | null ) =>
	question === 'technical-support';

/** Externally supported products have their own support, so there's no store to ask about. */
export const isStoreAsked = (
	question: HumanSupportQuestionType | null,
	product: WooHandoffProduct | null
) =>
	( question === 'technical-support' || question === 'pre-sales' ) &&
	product?.supportType !== 'external';

export const isStoreRequired = ( question: HumanSupportQuestionType | null ) =>
	question === 'technical-support';

export function getWooRoutingInput( {
	data,
	answers,
	flags,
}: {
	/** Null when WooCommerce.com couldn't send it. */
	data: WooHandoffData | null;
	answers: WooHandoffAnswers;
	flags: HumanRoutingFlags;
} ): HumanRoutingInput {
	const product =
		data?.supportedProducts.find( ( { slug } ) => slug === answers.productSlug ) ?? null;

	return {
		flags,
		question: answers.question,
		customer: data
			? {
					supportTier: data.supportTier,
					isPaying: data.isPaying,
					isWooEnterpriseCustomer: data.isWooEnterpriseCustomer,
				}
			: null,
		product: product && {
			slug: product.slug,
			supportType: product.supportType,
			isRevShare: product.isRevShare,
			isCore: product.slug === WOO_CORE_PRODUCT_SLUG,
		},
	};
}

/** A typed store address without a scheme gets one, as the support form does. */
export const normalizeStoreUrl = ( url: string ) =>
	/^https?:\/\//i.test( url ) ? url : `https://${ url }`;

/**
 * Zendesk's High priority trigger looks for `woo_emergency`. The type tag is for filtering and
 * reporting (WOOPUBR-2398).
 */
export function getWooEmergencyTags( { isEmergency, emergencyType }: HumanRoutingFlags ): string[] {
	if ( ! isEmergency ) {
		return [];
	}

	// Zendesk gets the tags as one comma-separated list, so only a plain slug can be a tag.
	const hasType =
		!! emergencyType && emergencyType !== 'none' && /^[a-z0-9_]+$/.test( emergencyType );

	return hasType ? [ 'woo_emergency', `woo_emergency_${ emergencyType }` ] : [ 'woo_emergency' ];
}

/** What the merchant and the bot told the Help Center, sent to Zendesk when the chat is created. */
export function getWooChatValues( {
	storeUrl,
	product,
	flags,
}: {
	storeUrl: string | null;
	product: WooHandoffProduct | null;
	flags: HumanRoutingFlags;
} ): HumanSupportChatValues {
	const tags = getWooEmergencyTags( flags );

	return {
		...( storeUrl && { siteUrl: normalizeStoreUrl( storeUrl ) } ),
		...( product?.zendeskSlug && {
			ticketFields: { [ ZENDESK_CUSTOM_FIELD_PRODUCT ]: product.zendeskSlug },
		} ),
		...( tags.length > 0 && { tags } ),
	};
}
