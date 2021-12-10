import { TranslateResult } from 'i18n-calypso';
import ActionCard from 'calypso/components/action-card';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export type GenericActionCardProps = {
	title: TranslateResult;
	description: TranslateResult;
	ctaText?: TranslateResult;
	isPrimary?: boolean;
};

export type DomainInfoCardProps = {
	domain: ResponseDomain;
	selectedSite: SiteData;
};

export type CardProps = Partial< React.ComponentProps< typeof ActionCard > > & {
	mainText: GenericActionCardProps[ 'description' ];

	headerText: GenericActionCardProps[ 'title' ];
	classNames: string;
};
