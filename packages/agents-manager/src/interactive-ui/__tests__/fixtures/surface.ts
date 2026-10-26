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

export const surfacePart = {
	type: 'data' as const,
	data: operations,
	metadata: { mimeType: 'application/a2ui+json' as const },
};

// Agenttic keeps A2UI's A2A data part under `a2ui`.
export const surfaceContent = { type: 'data' as const, data: { a2ui: surfacePart } };

// A form surface that sends its data to the agent.
export const formOperations = [
	{
		version: 'v1.0' as const,
		createSurface: { surfaceId: 'form', catalogId: BASIC_CATALOG_ID, sendDataModel: true },
	},
	{
		version: 'v1.0' as const,
		updateDataModel: { surfaceId: 'form', path: '/', value: { name: 'Ada' } },
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
