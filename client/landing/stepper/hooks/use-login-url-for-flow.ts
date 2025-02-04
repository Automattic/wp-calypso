import { addQueryArgs } from '@wordpress/url';
import { useHref, useLocation } from 'react-router';
import { getLoginUrl } from '../utils/path';
import { useFlowLocale } from './use-flow-locale';
import { useSiteData } from './use-site-data';
import type { Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';

type UseLoginUrlForFlowProps = {
	flow: Flow;
};

export function useLoginUrlForFlow( { flow }: UseLoginUrlForFlowProps ): string {
	const locale = useFlowLocale();
	const location = useLocation();
	const { siteId, siteSlug } = useSiteData();
	const path = useHref( location.pathname );
	const { extraQueryParams, customLoginPath } = flow.useLoginParams?.() ?? {};

	return getLoginUrlForFlow( {
		flow,
		path,
		locale,
		siteId,
		siteSlug,
		search: location.search,
		extraQueryParams,
		customLoginPath,
	} );
}

type GetLoginUrlForFlowProps = {
	flow: Flow;
	path: string;
	locale: string;
	siteId: string | number;
	siteSlug: string;
	search?: string;
	extraQueryParams?: Record< string, string | number >;
	customLoginPath?: string;
};

export function getLoginUrlForFlow( {
	flow,
	path,
	locale,
	siteId,
	siteSlug,
	search = window.location.search,
	extraQueryParams = {},
	customLoginPath,
}: GetLoginUrlForFlowProps ): string {
	const redirectTo = addQueryArgs( path, {
		...( locale && locale !== 'en' ? { locale } : {} ),
		...( siteId ? { siteId } : {} ),
		...( siteSlug ? { siteSlug } : {} ),
		...Object.fromEntries( new URLSearchParams( search ).entries() ),
	} );

	return getLoginUrl( {
		variationName: flow.variantSlug ?? flow.name,
		pageTitle: flow.title,
		locale,
		redirectTo,
		extra: extraQueryParams,
		customLoginPath,
	} );
}
