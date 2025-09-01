import type { JetpackModule } from '../data/site-jetpack-modules';

/**
 * Checks if a Jetpack module exists and is activated
 * @param modules - Record of Jetpack modules from the API
 * @param moduleName - Name of the module to check
 * @returns true if the module exists and is activated, false otherwise
 */
export function isJetpackModuleActivated(
	modules: Record< string, JetpackModule > | undefined,
	moduleName: string
): boolean {
	if ( ! modules || ! moduleName ) {
		return false;
	}

	const module = modules[ moduleName ];
	return !! ( module && module.activated );
}
