/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useTranslate, numberFormat, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getForCurrentCROIteration, Iterations } from './iterations';

/**
 * If the 'jetpackSocialProofHeader' test is active,
 * and the user is part of the 'withSocialProof_test' variation,
 * return translated text for a header that uses social proof;
 * otherwise, return undefined.
 */
const useMaybeSocialProofHeader = (): TranslateResult | undefined => {
	const translate = useTranslate();

	return useMemo( () => {
		return getForCurrentCROIteration( {
			[ Iterations.SPROOF ]: translate(
				'More than %(count)s websites trust Jetpack to protect their site',
				{ args: { count: numberFormat( 3_119_881, 0 ) } }
			),
		} );
	}, [ translate ] );
};

export default useMaybeSocialProofHeader;
