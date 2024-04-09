import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import CardHeading from 'calypso/components/card-heading';

const QuickActionsCard: FC = () => {
	const translate = useTranslate();

	return (
		<Card className="top-card">
			<CardHeading isBold>{ translate( 'Quick actions' ) }</CardHeading>
		</Card>
	);
};

export default QuickActionsCard;
