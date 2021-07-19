import { SimpleComponentObjectModel, MultiStepComponentObjectModel } from './types';

/**
 * For a provided component or page object model, makes sure it is present and ready to be used
 *
 * @param component instance of a component or page object model we are expecting to be present
 * @returns pointer to provided instance (for convenience)
 */
export async function multiExpectComponent< T extends MultiStepComponentObjectModel >(
	component: T
): Promise< T > {
	if ( component.waitUntilSettled ) {
		await component.waitUntilSettled();
	}

	if ( component.initializeState ) {
		await component.initializeState();
	}

	if ( component.validateStartingLayout ) {
		await component.validateStartingLayout();
	}

	return component;
}

/**
 * For a provided component or page object model, makes sure it is present and ready to be used
 *
 * @param component instance of a component or page object model we are expecting to be present
 * @returns pointer to provided instance (for convenience)
 */
export async function simpleExpectComponent< T extends SimpleComponentObjectModel >(
	component: T
): Promise< T > {
	await component.initialize();
	return component;
}
