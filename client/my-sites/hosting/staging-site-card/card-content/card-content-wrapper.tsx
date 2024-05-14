import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, PropsWithChildren } from 'react';
import CardHeading from 'calypso/components/card-heading';

export const CardContentWrapper: FunctionComponent< PropsWithChildren > = ( { children } ) => {
	const translate = useTranslate();
	return (
		<Card className="staging-site-card">
			<CardHeading id="staging-site">{ translate( 'Staging site' ) }</CardHeading>
			{ children }
		</Card>
	);
};
