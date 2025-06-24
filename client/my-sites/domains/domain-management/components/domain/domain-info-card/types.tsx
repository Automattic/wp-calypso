import ActionCard from 'calypso/components/action-card';
import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';

type ActionCardPropsBase = {
	title: TranslateResult;
	description: TranslateResult;
	buttonDisabled?: boolean;
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
	selectedSite: SiteDetails;
};
export type DomainDeleteInfoCardProps = DomainInfoCardProps & {
	purchase?: Purchase | null;
	isLoadingPurchase: boolean;
};

export type CardProps = Partial< React.ComponentProps< typeof ActionCard > > & {
	mainText: GenericActionCardProps[ 'description' ];

	headerText: GenericActionCardProps[ 'title' ];
	classNames: string;
};
