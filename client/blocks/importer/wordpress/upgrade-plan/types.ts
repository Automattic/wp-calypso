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
	pricing?: [ PricingMetaForGridPlan ];
	upgradePlanHostingDetailsList: Array< HostingDetailsItem >;
	showVariants?: boolean;
	onCtaClick?: ( planSlug: string ) => void;
};

export type UpgradePlanProps = {
	site: SiteDetails;
	isBusy: boolean;
	ctaText: string;
	subTitleText?: string;
	hideTitleAndSubTitle?: boolean;
	onFreeTrialClick?: () => void;
	navigateToVerifyEmailStep: () => void;
	onCtaClick: ( planSlug: string ) => void;
	onContentOnlyClick?: () => void;
	trackingEventsProps?: Record< string, unknown >;
	hideFreeMigrationTrialForNonVerifiedEmail?: boolean;
	showVariants?: boolean;
	visiblePlan?: PlanSlug;
};
