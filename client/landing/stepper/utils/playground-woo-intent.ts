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
