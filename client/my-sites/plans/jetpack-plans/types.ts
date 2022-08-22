import type { ITEM_TYPE_PLAN, ITEM_TYPE_PRODUCT } from './constants';
import type { PlanRecommendation } from './plan-upgrade/types';
import type {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	JetpackProductCategory,
} from '@automattic/calypso-products';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode, ReactElement } from 'react';

export type Duration = typeof TERM_ANNUALLY | typeof TERM_MONTHLY;
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

interface BasePageProps {
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
	displayCurrency?: string;
	displayFrom?: boolean;
	belowPriceText?: TranslateResult;
	categories?: JetpackProductCategory[];
}

export type SiteProduct = {
	tierUsage: number;
};
