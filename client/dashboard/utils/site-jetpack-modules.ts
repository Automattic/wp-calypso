import type { JetpackConnection, JetpackModule } from '@automattic/api-core';

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

/**
 * Checks if a Jetpack module requires a connection
 * @param modules - Record of Jetpack modules from the API
 * @param moduleName - Name of the module to check
 * @returns true if the module exists and requires connection, false otherwise
 */
export function jetpackModuleRequiresConnection(
	modules: Record< string, JetpackModule > | undefined,
	moduleName: string
): boolean {
	if ( ! modules || ! moduleName ) {
		return false;
	}

	const module = modules[ moduleName ];
	return !! ( module && module.requires_connection );
}

/**
 * Checks if a Jetpack module is available (exists and, if requires connection, connection is active)
 * @param modules - Record of Jetpack modules from the API
 * @param connection - Jetpack connection status from the API
 * @param moduleName - Name of the module to check
 * @returns true if the module is available, false otherwise
 */
export function isJetpackModuleAvailable(
	modules: Record< string, JetpackModule > | undefined,
	connection: JetpackConnection | undefined,
	moduleName: string
) {
	if ( ! modules || ! connection || ! moduleName ) {
		return false;
	}

	if ( ! jetpackModuleRequiresConnection( modules, moduleName ) ) {
		return true;
	}

	return ! connection.offlineMode.isActive;
}
