import type { SiteDetails } from '@automattic/data-stores';

/**
 * Types for the AI Assistant feature.
 */
export type Plan = {
	product_id: number;
	product_name: string;
	product_slug: string;
};
// AI Assistant feature props
export type UpgradeTypeProp = 'vip' | 'default';

export type TierUnlimitedProps = {
	slug: 'ai-assistant-tier-unlimited';
	limit: 999999999;
	value: 1;
	readableLimit: string;
};

export type TierFreeProps = {
	slug: 'ai-assistant-tier-free';
	limit: 20;
	value: 0;
};

export type Tier100Props = {
	slug: 'ai-assistant-tier-100';
	limit: 100;
	value: 100;
};

export type Tier200Props = {
	slug: 'ai-assistant-tier-200';
	limit: 200;
	value: 200;
};

export type Tier500Props = {
	slug: 'ai-assistant-tier-500';
	limit: 500;
	value: 500;
};

export type Tier750Props = {
	slug: 'ai-assistant-tier-750';
	limit: 750;
	value: 750;
};

export type Tier1000Props = {
	slug: 'ai-assistant-tier-1000';
	limit: 1000;
	value: 1000;
};

export type TierProp = {
	slug: TierSlugProp;
	limit: TierLimitProp;
	value: TierValueProp;
	readableLimit?: string;
};

export type TierLimitProp =
	| TierUnlimitedProps[ 'limit' ]
	| TierFreeProps[ 'limit' ]
	| Tier100Props[ 'limit' ]
	| Tier200Props[ 'limit' ]
	| Tier500Props[ 'limit' ]
	| Tier750Props[ 'limit' ]
	| Tier1000Props[ 'limit' ];

export type TierSlugProp =
	| TierUnlimitedProps[ 'slug' ]
	| TierFreeProps[ 'slug' ]
	| Tier100Props[ 'slug' ]
	| Tier200Props[ 'slug' ]
	| Tier500Props[ 'slug' ]
	| Tier750Props[ 'slug' ]
	| Tier1000Props[ 'slug' ];

export type TierValueProp =
	| TierUnlimitedProps[ 'value' ]
	| TierFreeProps[ 'value' ]
	| Tier100Props[ 'value' ]
	| Tier200Props[ 'value' ]
	| Tier500Props[ 'value' ]
	| Tier750Props[ 'value' ]
	| Tier1000Props[ 'value' ];

export type AiFeatureProps = {
	hasFeature: boolean;
	isOverLimit: boolean;
	requestsCount: number;
	requestsLimit: number;
	requireUpgrade: boolean;
	errorMessage?: string;
	errorCode?: string;
	upgradeType: UpgradeTypeProp;
	currentTier?: TierProp;
	usagePeriod?: {
		currentStart: string;
		nextStart: string;
		requestsCount: number;
	};
	nextTier?: TierProp | null;
	tierPlansEnabled?: boolean;
};

// Type used in the `wordpress-com/plans` store.
export type AiFeatureStateProps = AiFeatureProps & {
	_meta?: {
		isRequesting: boolean;
		asyncRequestCountdown: number;
		asyncRequestTimerId: number;
		isRequestingImage: boolean;
	};
};

export type Logo = {
	url: string;
	description: string;
	mediaId?: number;
};

export type LogoGeneratorStateProp = {
	_meta?: {
		isSavingLogoToLibrary: boolean;
		isApplyingLogo: boolean;
		isRequestingImage: boolean;
		isEnhancingPrompt: boolean;
		featureFetchError?: string | Error | null;
		firstLogoPromptFetchError?: string | Error | null;
		enhancePromptFetchError?: string | Error | null;
		logoFetchError?: string | Error | null;
	};
	siteDetails?: SiteDetails;
	features: {
		aiAssistantFeature?: AiFeatureStateProps;
	};
	history: Array< Logo >;
	selectedLogoIndex: number;
};

export type Selectors = {
	getAiAssistantFeature( siteId?: string ): Partial< AiFeatureProps >;
	getIsRequestingAiAssistantFeature(): boolean;
	getLogos(): Array< Logo >;
	getSelectedLogo(): Logo;
	getSiteDetails(): SiteDetails;
	getIsSavingLogoToLibrary(): boolean;
	getIsApplyingLogo(): boolean;
	getIsRequestingImage(): boolean;
	getIsEnhancingPrompt(): boolean;
	getIsBusy(): boolean;
	getRequireUpgrade(): boolean;
	getFeatureFetchError(): string | Error | null;
	getFirstLogoPromptFetchError(): string | Error | null;
	getEnhancePromptFetchError(): string | Error | null;
	getLogoFetchError(): string | Error | null;
};

/*
 * `sites/$site/ai-assistant-feature` endpoint response body props
 */
export type AiAssistantFeatureEndpointResponseProps = {
	'is-enabled': boolean;
	'has-feature': boolean;
	'is-over-limit': boolean;
	'requests-count': number;
	'requests-limit': number;
	'usage-period': {
		'current-start': string;
		'next-start': string;
		'requests-count': number;
	};
	'site-require-upgrade': boolean;
	'error-message'?: string;
	'error-code'?: string;
	'is-playground-visible'?: boolean;
	'upgrade-type': UpgradeTypeProp;
	'current-tier': TierProp;
	'tier-plans': Array< TierProp >;
	'next-tier'?: TierProp | null;
	'tier-plans-enabled': boolean;
};
