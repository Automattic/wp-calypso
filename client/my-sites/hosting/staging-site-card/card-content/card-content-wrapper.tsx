import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, PropsWithChildren } from 'react';
import { HostingCard } from 'calypso/components/hosting-card';

export const CardContentWrapper: FunctionComponent< PropsWithChildren > = ( {
	children,
	className,
} ) => {
	const translate = useTranslate();
	return (
		<HostingCard
			className={ classnames( 'staging-site-card', className ) }
			headingId="staging-site"
			title={ translate( 'Staging site' ) }
		>
			{ children }
		</HostingCard>
	);
};
