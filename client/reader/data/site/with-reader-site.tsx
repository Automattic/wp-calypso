import { useReaderSite, type UseReaderSiteResult } from './use-reader-site';
import type { ComponentType } from 'react';

export type WithReaderSiteProps = Pick< UseReaderSiteResult, 'site' | 'siteError' >;

type ReaderSiteIdProp = { siteId?: number | string };
type OuterProps< P > = Omit< P, keyof WithReaderSiteProps > & ReaderSiteIdProp;

/**
 * Higher-order component that injects `site` and `siteError` props from
 * `useReaderSite( props.siteId )`. Replaces the legacy `<QueryReaderSite>`
 * data component for class consumers. Components whose `siteId` is derived
 * from another prop should compute it in a thin local wrapper before
 * passing it down.
 */
export function withReaderSite< P extends WithReaderSiteProps >(
	WrappedComponent: ComponentType< P >,
	getSiteId?: ( props: OuterProps< P > ) => number | string | undefined
): ComponentType< OuterProps< P > > {
	const Wrapper = ( props: OuterProps< P > ) => {
		const siteId = getSiteId ? getSiteId( props ) : props.siteId;
		const { site, siteError } = useReaderSite( siteId );
		const merged = { ...props, site, siteError } as unknown as P;
		return <WrappedComponent { ...merged } />;
	};
	Wrapper.displayName = `withReaderSite(${
		WrappedComponent.displayName || WrappedComponent.name || 'Component'
	})`;
	return Wrapper;
}
