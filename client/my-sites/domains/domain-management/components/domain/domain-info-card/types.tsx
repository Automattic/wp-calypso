import { TranslateResult } from 'i18n-calypso';
import ActionCard from 'calypso/components/action-card';

export type DomainInfoCardProps = {
	title: TranslateResult;
	description: TranslateResult;
	ctaText?: TranslateResult;
	isPrimary?: boolean;
};

export type CardProps = Partial< React.ComponentProps< typeof ActionCard > > & {
	mainText: DomainInfoCardProps[ 'description' ];
	headerText: DomainInfoCardProps[ 'title' ];
	classNames: string;
};
