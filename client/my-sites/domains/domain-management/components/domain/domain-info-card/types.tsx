import { TranslateResult } from 'i18n-calypso';
import ActionCard from 'calypso/components/action-card';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

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

type ActionCardPropsWithHref = ActionCardPropsWithCta & {
	type: 'href';
	href: string;
};

export type GenericActionCardProps =
	| ActionCardPropsWithHref
	| ActionCardPropsWithCallback
	| ActionCardPropsInfoOnly;

export type DomainInfoCardProps = {
	domain: ResponseDomain;
	selectedSite: SiteData;
};

export type CardProps = Partial< React.ComponentProps< typeof ActionCard > > & {
	mainText: GenericActionCardProps[ 'description' ];

	headerText: GenericActionCardProps[ 'title' ];
	classNames: string;
};
