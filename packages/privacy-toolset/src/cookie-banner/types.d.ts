type ShortText = string;
type LongText = ReactNode | string;

type Buckets = {
	essential: boolean;
	analytics: boolean;
	advertising: boolean;
};

type GranularConsentContent = {
	name: ShortText;
	description: LongText;
};

export type SimpleConsentContent = {
	description: LongText;
	customizeButton: ShortText;
	acceptAllButton: ShortText;
};

export type CustomizedConsentContent = {
	description: LongText;
	categories: Record< keyof Buckets, GranularConsentContent >;
	acceptSelectionButton: ShortText;
};
