import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactNode } from 'react';
import { HostingCard } from 'calypso/components/hosting-card';

interface Props {
	children: ReactNode;
	className?: string;
}

export const CardContentWrapper: FunctionComponent< Props > = ( { children, className } ) => {
	const translate = useTranslate();
	return (
		<HostingCard
			className={ clsx( 'staging-site-card', className ) }
			headingId="staging-site"
			title={ translate( 'Staging site' ) }
		>
			{ children }
		</HostingCard>
	);
};
