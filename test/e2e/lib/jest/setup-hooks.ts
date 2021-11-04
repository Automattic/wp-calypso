import { createTestHookHandlers } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

export function setupHooks( callback: ( createdPage: Page ) => void ): void {
	const { setup, tearDown } = createTestHookHandlers();

	beforeAll( async () => {
		const page = await setup();
		callback( page );
	} );

	afterAll( async () => {
		await tearDown();
	} );
}
