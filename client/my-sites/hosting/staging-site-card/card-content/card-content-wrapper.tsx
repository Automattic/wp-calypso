import { Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, PropsWithChildren } from 'react';
import CardHeading from 'calypso/components/card-heading';

export const CardContentWrapper: FunctionComponent< PropsWithChildren > = ( { children } ) => {
	const translate = useTranslate();
	return (
		<Card className="staging-site-card">
			{
				// eslint-disable-next-line wpcalypso/jsx-gridicon-size
				<Gridicon icon="science" size={ 32 } />
			}
			<CardHeading id="staging-site">{ translate( 'Staging site' ) }</CardHeading>
			{ children }
		</Card>
	);
};
