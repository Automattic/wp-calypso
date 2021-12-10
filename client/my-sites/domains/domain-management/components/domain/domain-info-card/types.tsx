import ActionCard from 'calypso/components/action-card';

export type DomainInfoCardProps = {
	title: boolean;
	description: string;
	ctaText?: string;
	isPrimary?: boolean;
};

export type CardProps = Partial< React.ComponentProps< typeof ActionCard > > & {
	mainText: DomainInfoCardProps[ 'description' ];
	headerText: DomainInfoCardProps[ 'title' ];
	classNames: string;
};
