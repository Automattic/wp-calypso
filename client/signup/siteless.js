/**
 * Internal dependencies
 */
import config from 'config';

export const isSitelessCheckoutEnabledForFlow = ( flowName ) => {
	return flowName && config.isEnabled( `signup/siteless-checkout/${ flowName }` );
};
