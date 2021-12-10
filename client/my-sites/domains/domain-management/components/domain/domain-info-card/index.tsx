import ActionCard from 'calypso/components/action-card';
import type { CardProps, DomainInfoCardProps } from './types';

const DomainInfoCard = ( {
	title,
	description,
	ctaText,
	isPrimary,
}: DomainInfoCardProps ): JSX.Element => {
	const cardProps: CardProps = {
		headerText: title,
		mainText: description,
		classNames: 'domain-info-card',
	};

	if ( ctaText ) {
		cardProps.buttonText = ctaText;
		cardProps.buttonPrimary = isPrimary;
	}

	return <ActionCard { ...cardProps }></ActionCard>;
};

export default DomainInfoCard;
