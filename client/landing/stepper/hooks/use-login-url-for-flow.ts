import { addQueryArgs } from '@wordpress/url';
import { useHref, useLocation } from 'react-router';
import { useLoginUrl } from '../utils/path';
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

	const redirectTo = addQueryArgs( path, {
		...( locale && locale !== 'en' ? { locale } : {} ),
		...( siteId ? { siteId } : {} ),
		...( siteSlug ? { siteSlug } : {} ),
		...Object.fromEntries( new URLSearchParams( location.search ).entries() ),
	} );

	return useLoginUrl( {
		variationName: flow.variantSlug ?? flow.name,
		pageTitle: flow.title,
		locale,
		redirectTo,
	} );
}
