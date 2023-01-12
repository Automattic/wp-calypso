export type PlanProperties = {
	cartItemForPlan: {
		product_slug: string;
	} | null;
	currencyCode: string | null;
	discountPrice: number | null;
	features: any;
	jpFeatures: any;
	isLandingPage: boolean;
	isPlaceholder: boolean;
	planConstantObj: any;
	planName: any;
	planObject: any;
	product_name_short: any;
	hideMonthly: any;
	rawPrice: number | null;
	rawPriceAnnual: number | null;
	rawPriceForMonthlyPlan: number | null;
	relatedMonthlyPlan: any;
	annualPricePerMonth: number | null;
	isMonthlyPlan: boolean;
	tagline: any;
	storageOptions: any;
};

export interface PlanFeature {
	availableForCurrentPlan?: boolean;
	availableOnlyForAnnualPlans?: boolean;
	getSlug: () => React.ReactNode;
	getTitle: ( name?: string ) => React.ReactNode;
	getDescription: () => React.ReactNode;
}
