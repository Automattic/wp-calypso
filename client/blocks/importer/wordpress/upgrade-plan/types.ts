import type { PlanSlug } from '@automattic/calypso-products';
import type { PricingMetaForGridPlan, SiteDetails } from '@automattic/data-stores';
import type { ReactNode } from 'react';

export type HostingDetailsItem = {
	title: string;
	description: string | ReactNode;
	icon: JSX.Element;
};

export type HostingDetails = {
	[ key: string ]: HostingDetailsItem;
};

export type UpgradePlanDetailsProps = {
	children: React.ReactNode;
	introOfferAvailable: boolean;
	pricing?: { [ key: string ]: PricingMetaForGridPlan };
	upgradePlanHostingDetailsList: Array< HostingDetailsItem >;
	showVariants?: boolean;
	onCtaClick?: ( planSlug: PlanSlug ) => void;
	planSlugs: Array< PlanSlug >;
};

export type UpgradePlanProps = {
	site: SiteDetails;
	isBusy: boolean;
	ctaText: string;
	subTitleText?: string;
	hideTitleAndSubTitle?: boolean;
	onFreeTrialClick?: () => void;
	navigateToVerifyEmailStep: () => void;
	onCtaClick: ( planSlug: PlanSlug ) => void;
	onContentOnlyClick?: () => void;
	trackingEventsProps?: Record< string, unknown >;
	hideFreeMigrationTrialForNonVerifiedEmail?: boolean;
	showVariants?: boolean;
	visiblePlan?: PlanSlug;
};
