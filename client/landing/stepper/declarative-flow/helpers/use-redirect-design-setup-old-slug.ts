import { useEffect } from 'react';
import type { StepperStep, Navigate } from '../internals/types';

export function useRedirectDesignSetupOldSlug(
	currentStep: string,
	navigate: Navigate< StepperStep[] >
) {
	useEffect( () => {
		if ( currentStep === 'designSetup' ) {
			navigate( 'design-setup' );
		}
	}, [ currentStep, navigate ] );
}
