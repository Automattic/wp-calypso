import type {
	HumanRoutingFlags,
	HumanRoutingInput,
	HumanSupportQuestionType,
	ProductSupportType,
	SupportTier,
} from './types';

/** The synthetic product the support form uses for WooCommerce Core itself. */
export const WOO_CORE_PRODUCT_SLUG = 'wc-core';

export type WooHandoffStore = {
	url: string;
	domain: string;
};

export type WooHandoffProduct = {
	slug: string;
	name: string;
	supportType: ProductSupportType;
	isRevShare: boolean;
	/** Where an externally supported product takes support requests. */
	externalSupportUrl?: string | null;
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
