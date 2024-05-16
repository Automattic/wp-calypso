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
	flow: { name: flowName, variantSlug: flowVariantSlug },
	loginUrlParams = {},
	pageTitle,
	returnStepSlug,
	returnUrlParams = {},
}: UseFlowLoginUrlProps ): string {
	// Note: We SHOULD NOT call any hooks on the incoming flow argument.
	// We accept the argument as a cleaner API to get flow.name and flow.variantSlug.
	const locale = useFlowLocale();

	const flowPath = flowVariantSlug ?? flowName;
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
		variationName: flowName,
		pageTitle,
		locale,
		redirectTo,
	} );

	return addQueryArgs( loginUrl, loginUrlParams );
}
