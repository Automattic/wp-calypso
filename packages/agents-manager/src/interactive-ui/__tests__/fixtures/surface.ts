import { createInteractiveUiCatalog, createInteractiveUiRuntime } from '@automattic/ai-ui-renderer';
import { BASIC_CATALOG_ID } from '@automattic/ai-ui-renderer/capabilities';
import type { InteractiveUiBatch } from '../../messages';

export const operations = [
	{
		version: 'v1.0' as const,
		createSurface: { surfaceId: 'test-surface', catalogId: BASIC_CATALOG_ID },
	},
	{
		version: 'v1.0' as const,
		updateComponents: {
			surfaceId: 'test-surface',
			components: [ { id: 'root', component: 'Text', text: 'Test surface' } ],
		},
	},
];

export const createRuntime = () =>
	createInteractiveUiRuntime( {
		catalogs: [ createInteractiveUiCatalog() ],
		onAction: jest.fn(),
		onError: jest.fn(),
	} );

export const createBatch = (
	batchOperations: InteractiveUiBatch[ 'operations' ],
	messageId: string
): InteractiveUiBatch => ( {
	operations: batchOperations,
	messageId,
	signature: messageId,
} );
