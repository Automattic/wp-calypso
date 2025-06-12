import { useEffect } from 'react';
import { getStepOldSlug } from './get-step-old-slug';
import type { Navigate } from '../internals/types';

const DESIGN_SETUP_SLUG = 'design-setup';

export function useRedirectDesignSetupOldSlug( currentStep: string, navigate: Navigate ) {
	const oldSlug = getStepOldSlug( DESIGN_SETUP_SLUG );
	useEffect( () => {
		if ( currentStep === oldSlug ) {
			navigate( DESIGN_SETUP_SLUG );
		}
	}, [ currentStep, navigate, oldSlug ] );
}
