import { useSafeGlobalStylesOutput, transformStyles } from '@automattic/global-styles';
import { useMemo } from 'react';
import type { StyleVariation } from '@automattic/design-picker/src/types';

const INJECTED_CSS = `body{ transition: background-color 0.2s linear, color 0.2s linear; }`;

const getVariationBySlug = ( variations: StyleVariation[], slug: string ) =>
	variations.find( ( variation ) => variation.slug === slug );

const useInlineCss = ( variations?: StyleVariation[], selectedVariation?: StyleVariation ) => {
	const [ globalStyles ] = useSafeGlobalStylesOutput();

	return useMemo( () => {
		let inlineCss = INJECTED_CSS;

		if ( globalStyles ) {
			inlineCss += transformStyles( globalStyles ).filter( Boolean ).join( '' );
		}

		if ( variations && selectedVariation ) {
			inlineCss +=
				selectedVariation.inline_css ??
				( getVariationBySlug( variations, selectedVariation.slug ?? '' )?.inline_css || '' );
		}

		return inlineCss;
	}, [ variations, selectedVariation, globalStyles ] );
};

export default useInlineCss;
