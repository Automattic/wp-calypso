import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import CardHeading from 'calypso/components/card-heading';

const QuickActionsCard: FC< QuickActionsProps > = () => {
	const translate = useTranslate();

	return (
		<Card>
			<CardHeading isBold>{ translate( 'Quick actions' ) }</CardHeading>
		</Card>
	);
};

export default QuickActionsCard;
