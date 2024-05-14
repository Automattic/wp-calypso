import { addQueryArgs } from '@wordpress/url';
import { useLoginUrl } from '../utils/path';
import { useFlowLocale } from './use-flow-locale';
import type { Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';

type UseFlowLoginUrlProps = {
	flow: Flow;
	loginUrlParams?: Record< string, string | number >;
	pageTitle?: string;
	returnStepSlug?: string;
	returnUrlParams?: Record< string, string | number >;
};

export function useFlowLoginUrl( {
	flow,
	loginUrlParams = {},
	pageTitle,
	returnStepSlug,
	returnUrlParams = {},
}: UseFlowLoginUrlProps ): string {
	const locale = useFlowLocale();

	const flowPath = flow.variantSlug ?? flow.name;
	const isNonEnglishLocale = locale && locale !== 'en';
	const returnQueryParams = {
		...returnUrlParams,
		...( isNonEnglishLocale ? { locale } : {} ),
	};

	const redirectTo = addQueryArgs(
		`/setup/${ flowPath }${ returnStepSlug ? `/${ returnStepSlug }` : '' }`,
		returnQueryParams
	);

	const loginUrl = useLoginUrl( {
		variationName: flow.name,
		pageTitle,
		locale,
		redirectTo,
	} );

	return addQueryArgs( loginUrl, loginUrlParams );
}
