import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PlanCard: FC = () => {
	const site = useSelector( getSelectedSite );
	const planName = site?.plan?.product_name_short ?? '';

	const translate = useTranslate();

	console.debug( 'site', site );
	console.debug( 'planName', planName );
	return (
		<Card className="hosting-overview__card">
			<CardHeading isBold>{ planName }</CardHeading>
		</Card>
	);
};

export default PlanCard;
