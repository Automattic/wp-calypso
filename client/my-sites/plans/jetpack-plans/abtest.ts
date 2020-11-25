/**
 * Internal dependencies
 */
import { abtest } from 'calypso/lib/abtest';

/**
 * Returns the name of the Conversion Rate Optimization test that is currently active.
 *
 * @returns {string}  The name of the active test.
 */
export const getJetpackCROActiveVersion = (): string => {
	const currentVariant = abtest( 'jetpackConversionRateOptimization' );

	switch ( currentVariant ) {
		case 'v0 - Offer Reset':
			return 'v0';
		case 'v1 - 3 cols layout':
			return 'v1';
		case 'v2 - slide outs':
			return 'v2';
		case 'i5 - Saas table design':
			return 'i5';
	}

	return 'v1';
};
