import type { ITEM_TYPE_PLAN, ITEM_TYPE_PRODUCT } from './constants';
import type { PlanRecommendation } from './plan-upgrade/types';
import type {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	TERM_QUADRENNIALLY,
	TERM_QUINQUENNIALLY,
	TERM_SEXENNIALLY,
	TERM_SEPTENNIALLY,
	TERM_OCTENNIALLY,
	TERM_NOVENNIALLY,
	TERM_DECENNIALLY,
	TERM_CENTENNIALLY,
	JetpackProductCategory,
	JetpackTag,
	FAQ,
} from '@automattic/calypso-products';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode, ReactElement } from 'react';

export type Duration =
	| typeof TERM_ANNUALLY
	| typeof TERM_MONTHLY
	| typeof TERM_BIENNIALLY
	| typeof TERM_TRIENNIALLY
	| typeof TERM_QUADRENNIALLY
	| typeof TERM_QUINQUENNIALLY
	| typeof TERM_SEXENNIALLY
	| typeof TERM_SEPTENNIALLY
	| typeof TERM_OCTENNIALLY
	| typeof TERM_NOVENNIALLY
	| typeof TERM_DECENNIALLY
	| typeof TERM_CENTENNIALLY;
export type DurationString = 'annual' | 'monthly';
export type ItemType = typeof ITEM_TYPE_PLAN | typeof ITEM_TYPE_PRODUCT;

export interface QueryArgs {
	[ key: string ]: string;
}

export type PurchaseCallback = ( arg0: SelectorProduct, arg1?: boolean, arg2?: Purchase ) => void;
export type PurchaseURLCallback = (
	arg0: SelectorProduct,
	arg1?: boolean,
	arg2?: Purchase
) => string | undefined;
export type DurationChangeCallback = ( arg0: Duration ) => void;
export type ScrollCardIntoViewCallback = ( arg0: HTMLDivElement, arg1: string ) => void;

export interface BasePageProps {
	rootUrl: string;
	urlQueryArgs: QueryArgs;
	nav?: ReactNode;
	header: ReactNode;
	footer?: ReactNode;
}

export interface SelectorPageProps extends BasePageProps {
	defaultDuration?: Duration;
	siteSlug?: string;
	planRecommendation?: PlanRecommendation;
	highlightedProducts?: string[];
	enableUserLicensesDialog?: boolean;
	locale?: string;
}

export interface ProductsGridProps {
	duration: Duration;
	urlQueryArgs: QueryArgs;
	planRecommendation?: PlanRecommendation;
	onSelectProduct: PurchaseCallback;
	onDurationChange?: DurationChangeCallback;
	scrollCardIntoView: ScrollCardIntoViewCallback;
	createButtonURL?: PurchaseURLCallback;
	isLoadingUpsellPageExperiment?: boolean;
}

export type PlanGridProducts = {
	availableProducts: SelectorProduct[];
	purchasedProducts: SelectorProduct[];
	includedInPlanProducts: SelectorProduct[];
};

export interface JetpackFreeProps {
	fullWidth?: boolean;
	urlQueryArgs: QueryArgs;
	siteId: number | null;
}

export type SelectorProductCost = {
	isFree?: boolean;
	cost?: number;
	discountCost?: number;
	loadingCost?: boolean;
};

export type SelectorProductFeaturesItem = {
	slug: string;
	icon?:
		| string
		| {
				icon: string;
				component?: ReactElement;
		  };
	text: TranslateResult;
	description?: TranslateResult;
	subitems?: SelectorProductFeaturesItem[];
	isHighlighted?: boolean;
	isDifferentiator?: boolean;
};

export type SelectorProductFeatures = {
	items: SelectorProductFeaturesItem[];
};

export interface SelectorProduct extends SelectorProductCost {
	productSlug: string;
	productAlias?: string;
	annualOptionSlug?: string;
	monthlyOptionSlug?: string;
	iconSlug: string;
	type: ItemType;
	costProductSlug?: string;
	monthlyProductSlug?: string;
	displayName: TranslateResult;
	shortName: TranslateResult;
	subheader?: TranslateResult;
	tagline: TranslateResult;
	description: TranslateResult | ReactNode;
	shortDescription?: TranslateResult | ReactNode;
	children?: ReactNode;
	term: Duration;
	buttonLabel?: TranslateResult;
	features: SelectorProductFeatures;
	disclaimer?: TranslateResult | ReactNode;
	infoText?: TranslateResult | ReactNode;
	legacy?: boolean;
	hidePrice?: boolean;
	externalUrl?: string;
	displayTerm?: Duration;
	displayPrice?: number;
	displayPriceText?: TranslateResult | null;
	displayCurrency?: string;
	displayFrom?: boolean;
	belowPriceText?: TranslateResult;
	categories?: JetpackProductCategory[];
	featuredDescription?: TranslateResult | string;
	lightboxDescription?: TranslateResult | string;
	productsIncluded?: ReadonlyArray< string >;
	whatIsIncluded?: Array< TranslateResult >;
	whatIsIncludedComingSoon?: Array< TranslateResult >;
	alsoIncluded?: Array< TranslateResult >;
	benefits?: Array< TranslateResult >;
	benefitsComingSoon?: Array< TranslateResult >;
	faqs?: Array< FAQ >;
	recommendedFor?: Array< JetpackTag >;
	forceNoYearlyUpgrade?: boolean;
	moreAboutUrl?: string;
	indirectCheckoutUrl?: string;
	quantity?: number | null;
}

export interface PartnerSelectorProduct {
	shortName: TranslateResult;
	productSlug: string;
	moreAboutUrl: string;
	externalUrl?: string;
}

export type SiteProduct = {
	tierUsage: number;
};
