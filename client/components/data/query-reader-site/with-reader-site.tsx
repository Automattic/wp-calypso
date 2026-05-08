import { useReaderSite, type UseReaderSiteResult } from './use-reader-site';
import type { ComponentType } from 'react';

export type WithReaderSiteProps = Pick< UseReaderSiteResult, 'site' | 'siteError' >;

type SiteId = number | string | undefined;
type ReaderSiteIdProp = { siteId?: SiteId };
type GetSiteId< P > = ( props: P ) => SiteId;

/**
 * Higher-order component that injects `site` and `siteError` props from
 * `useReaderSite( siteId )`. Replaces the legacy `<QueryReaderSite>` data
 * component for both class and function consumers.
 *
 * By default the HOC reads `siteId` from the wrapped component's props. Pass
 * a `getSiteId` selector to derive it from another prop (e.g. `props.post?.site_ID`).
 */
export function withReaderSite< P extends WithReaderSiteProps >(
	WrappedComponent: ComponentType< P >,
	getSiteId?: GetSiteId< Omit< P, keyof WithReaderSiteProps > >
): ComponentType< Omit< P, keyof WithReaderSiteProps > & ReaderSiteIdProp > {
	const Wrapper = ( props: Omit< P, keyof WithReaderSiteProps > & ReaderSiteIdProp ) => {
		const siteId = getSiteId
			? getSiteId( props as Omit< P, keyof WithReaderSiteProps > )
			: props.siteId;
		const { site, siteError } = useReaderSite( siteId );
		const merged = { ...props, site, siteError } as unknown as P;
		return <WrappedComponent { ...merged } />;
	};
	Wrapper.displayName = `withReaderSite(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;
	return Wrapper;
}
