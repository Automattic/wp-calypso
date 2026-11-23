import { ONBOARDING_FLOW } from '@automattic/onboarding';

/**
 * Whether the Playground step was entered from WooCommerce.com. Shared by the
 * server-rendered loader, the Stepper loaders and the step itself so their
 * branding always agrees with the flow's routing, which reads the same URL intent.
 */
export const isPlaygroundWooIntent = (
	flowName: string | undefined,
	stepName: string | undefined,
	intent: unknown
) => flowName === ONBOARDING_FLOW && stepName === 'playground' && intent === 'woocommerce';

/**
 * Whether this run saves a store from the WooCommerce Playground. Read from the URL on every
 * step, because the Playground step's query rides along to checkout and on to the importer,
 * so a run continued in another tab or after signing in stays a store.
 */
export const isPlaygroundStoreRun = ( query: URLSearchParams ) =>
	!! query.get( 'playground' ) && query.get( 'intent' ) === 'woocommerce';

/**
 * Whether this onboarding visit saves a store from the WooCommerce Playground, from its first
 * render. On the Playground step, the store's ID only reaches the URL once the Playground boots.
 */
export const isPlaygroundStoreVisit = (
	query: URLSearchParams,
	pathname = window.location.pathname
) => {
	const [ , , flowName, stepName ] = pathname.split( '/' );

	return (
		isPlaygroundStoreRun( query ) ||
		isPlaygroundWooIntent( flowName, stepName, query.get( 'intent' ) )
	);
};
