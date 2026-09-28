import { select } from '@wordpress/data';
import { getBlockTreeCallback } from '../callback';

jest.mock( '@wordpress/data', () => ( { select: jest.fn() } ) );

const mockedSelect = select as jest.Mock;

describe( 'getBlockTreeCallback', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns a serializable recursive tree and the current selection', async () => {
		const paragraph = {
			clientId: 'paragraph-1',
			name: 'core/paragraph',
			attributes: { content: 'Hello' },
			innerBlocks: [],
		};
		const group = {
			clientId: 'group-1',
			name: 'core/group',
			attributes: { layout: { type: 'constrained' } },
			innerBlocks: [],
		};
		mockedSelect.mockReturnValue( {
			getSelectedBlockClientId: () => 'paragraph-1',
			getBlocks: ( clientId?: string ) => ( clientId === 'group-1' ? [ paragraph ] : [ group ] ),
		} );

		await expect( getBlockTreeCallback() ).resolves.toMatchObject( {
			result: {
				success: true,
				details: {
					selectedBlockClientId: 'paragraph-1',
					blockCount: 2,
					blocks: [
						{
							clientId: 'group-1',
							name: 'core/group',
							innerBlocks: [
								{
									clientId: 'paragraph-1',
									name: 'core/paragraph',
									attributes: { content: 'Hello' },
								},
							],
						},
					],
				},
			},
			returnToAgent: true,
		} );
	} );

	it( 'falls back to block-owned children and avoids cycles', async () => {
		const child = {
			clientId: 'child-1',
			name: 'core/paragraph',
			attributes: {},
			innerBlocks: [],
		};
		const parent = {
			clientId: 'parent-1',
			name: 'core/group',
			attributes: {},
			innerBlocks: [ child ],
		};
		child.innerBlocks = [ parent ] as never[];
		mockedSelect.mockReturnValue( {
			getSelectedBlockClientId: () => null,
			getBlocks: ( clientId?: string ) => ( clientId ? [] : [ parent ] ),
		} );

		const result = await getBlockTreeCallback();
		expect( result.result.details ).toMatchObject( {
			selectedBlockClientId: null,
			blockCount: 2,
		} );
	} );

	it( 'returns a structured error outside the block editor', async () => {
		mockedSelect.mockReturnValue( undefined );

		await expect( getBlockTreeCallback() ).resolves.toMatchObject( {
			result: {
				success: false,
				error: 'The block editor data store is unavailable.',
			},
			returnToAgent: true,
		} );
	} );
} );
