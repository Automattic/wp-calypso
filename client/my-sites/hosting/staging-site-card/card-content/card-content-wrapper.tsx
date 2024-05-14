import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, PropsWithChildren } from 'react';
import { HostingCard } from 'calypso/components/hosting-card';

export const CardContentWrapper: FunctionComponent< PropsWithChildren > = ( { children } ) => {
	const translate = useTranslate();
	return (
		<HostingCard
			className="staging-site-card"
			headingId="staging-site"
			title={ translate( 'Staging site' ) }
		>
			{ children }
		</HostingCard>
	);
};
