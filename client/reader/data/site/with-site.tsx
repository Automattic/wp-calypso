import { useSite, type UseSiteResult } from './use-site';
import type { ComponentType } from 'react';

export type WithSiteProps = Pick< UseSiteResult, 'site' | 'siteError' >;

type SiteIdProp = { siteId?: number | string };
type OuterProps< P > = Omit< P, keyof WithSiteProps > & SiteIdProp;

/**
 * Higher-order component that injects `site` and `siteError` props from
 * `useSite( props.siteId )`. Components whose `siteId` is derived from
 * another prop should compute it in a thin local wrapper before passing it down.
 */
export function withSite< P extends WithSiteProps >(
	WrappedComponent: ComponentType< P >,
	getSiteId?: ( props: OuterProps< P > ) => number | string | undefined
): ComponentType< OuterProps< P > > {
	const Wrapper = ( props: OuterProps< P > ) => {
		const siteId = getSiteId ? getSiteId( props ) : props.siteId;
		const { site, siteError } = useSite( siteId );
		const merged = { ...props, site, siteError } as unknown as P;
		return <WrappedComponent { ...merged } />;
	};
	Wrapper.displayName = `withSite(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;
	return Wrapper;
}
