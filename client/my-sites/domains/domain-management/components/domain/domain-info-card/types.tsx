import ActionCard from 'calypso/components/action-card';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { TranslateResult } from 'i18n-calypso';

type ActionCardPropsBase = {
	title: TranslateResult;
	description: TranslateResult;
};

type ActionCardPropsInfoOnly = ActionCardPropsBase & {
	type: 'info';
};

type ActionCardPropsWithCta = ActionCardPropsBase & {
	ctaText: TranslateResult;
	isPrimary?: boolean;
};

type ActionCardPropsWithCallback = ActionCardPropsWithCta & {
	type: 'click';
	onClick: () => void;
};

type ActionCardPropsWithCustomCta = ActionCardPropsBase & {
	type: 'custom';
	cta: React.ReactNode;
};

type ActionCardPropsWithHref = ActionCardPropsWithCta & {
	type: 'href';
	href: string;
};

export type GenericActionCardProps =
	| ActionCardPropsWithHref
	| ActionCardPropsWithCallback
	| ActionCardPropsWithCustomCta
	| ActionCardPropsInfoOnly;

export type DomainInfoCardProps = {
	domain: ResponseDomain;
	selectedSite: SiteData;
};
export type DomainDeleteInfoCardProps = DomainInfoCardProps & {
	selectedSite: SiteData;
	purchase?: Purchase | null;
	isLoadingPurchase: boolean;
};

export type CardProps = Partial< React.ComponentProps< typeof ActionCard > > & {
	mainText: GenericActionCardProps[ 'description' ];

	headerText: GenericActionCardProps[ 'title' ];
	classNames: string;
};
