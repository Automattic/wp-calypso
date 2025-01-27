import { HostingHero } from 'calypso/components/hosting-hero';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

export const Container = ( { children }: { children: ReactNode } ) => {
	return (
		<div className="migration-overview__container">
			<div className="migration-overview__content">{ children }</div>
		</div>
	);
};

export const Header = ( {
	title,
	subTitle,
	children,
}: {
	title: string;
	subTitle: string | TranslateResult;
	children?: ReactNode;
} ) => {
	return (
		<HostingHero className="migration-overview__header">
			<h1>{ title }</h1>
			<p>{ subTitle }</p>
			{ children }
		</HostingHero>
	);
};
