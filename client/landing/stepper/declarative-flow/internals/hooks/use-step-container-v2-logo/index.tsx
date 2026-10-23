import { useMemo } from 'react';
import { useQuery } from '../../../../hooks/use-query';
import { isPlaygroundWooIntent } from '../../../../utils/playground-woo-intent';
import { WooTopBarLogo } from '../../components/woo-top-bar-logo';

/**
 * The logo every StepContainerV2 top bar in the flow falls back to, including
 * the loaders shown before a step mounts. `null` keeps the default logo.
 */
export const useStepContainerV2Logo = ( flowName: string, stepName: string ) => {
	const intent = useQuery().get( 'intent' );

	return useMemo(
		() => ( isPlaygroundWooIntent( flowName, stepName, intent ) ? <WooTopBarLogo /> : null ),
		[ flowName, stepName, intent ]
	);
};
