import apiFetch from '@wordpress/api-fetch';
import { vi } from 'vitest';
import { withBlockEditCorrections } from '../block-edit-corrections';
import type { ToolProvider } from '../../extension-types';

vi.mock( '@wordpress/api-fetch' );

const blocks = [ { clientId: 'block-1', name: 'core/image', attributes: {}, innerBlocks: [] } ];
const edits = {
	updates: [ { clientId: 'block-1', name: 'core/image', attributes: { width: 300 } } ],
};
const reverseMap = { 'block-1': 'block-1' };

function createToolProvider(): ToolProvider {
	return {
		getAbilities: vi.fn(),
		executeAbility: vi.fn( async ( name: string ) =>
			name === 'agents-manager/get-block-tree'
				? { result: { success: true, message: 'Read.', details: { blocks } } }
				: { result: { success: true, message: 'Applied.' } }
		),
	};
}

describe( 'withBlockEditCorrections', () => {
	beforeEach( () => {
		vi.mocked( apiFetch ).mockReset();
	} );

	it( 'applies the corrected edits, checked against the live block tree', async () => {
		const corrected = { updates: [ { ...edits.updates[ 0 ], attributes: { width: '300px' } } ] };
		vi.mocked( apiFetch ).mockResolvedValue( { edits: corrected } );
		const toolProvider = createToolProvider();

		await withBlockEditCorrections( toolProvider ).executeAbility( 'big-sky/apply-block-edits', {
			...edits,
			reverseMap,
		} );

		expect( apiFetch ).toHaveBeenCalledWith( {
			method: 'POST',
			path: '/wp-abilities/v1/abilities/wpcom/correct-block-edits/run?webmcp=1',
			data: {
				input: { edits, context: { 'client.gutenberg_page.current_page_content': blocks } },
			},
		} );
		expect( toolProvider.executeAbility ).toHaveBeenLastCalledWith( 'big-sky/apply-block-edits', {
			...corrected,
			reverseMap,
		} );
	} );

	it( 'sends rich text from parsed markup as its text', async () => {
		class RichText {
			constructor( private readonly text: string ) {}

			toJSON() {
				return this.text;
			}
		}
		vi.mocked( apiFetch ).mockResolvedValue( { edits: {} } );
		const block = { name: 'core/heading', attributes: { content: new RichText( 'Heading' ) } };

		await withBlockEditCorrections( createToolProvider() ).executeAbility(
			'big-sky/apply-block-edits',
			{ inserts: [ { block } ], reverseMap }
		);

		expect( apiFetch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				data: expect.objectContaining( {
					input: expect.objectContaining( {
						edits: { inserts: [ { block: { ...block, attributes: { content: 'Heading' } } } ] },
					} ),
				} ),
			} )
		);
	} );

	it.each( [
		[
			'an unchanged outcome',
			async () => ( { success: true, outcome: 'unchanged', message: 'Already full width.' } ),
			{ success: true, outcome: 'unchanged', message: 'Already full width.' },
		],
		[
			'a correction error',
			async () => {
				throw { code: 'invalid-delete-client-id', message: 'No block "gone".' };
			},
			expect.objectContaining( { success: false, error: 'No block "gone".' } ),
		],
	] )( 'returns %s without applying the edits', async ( _case, respond, result ) => {
		vi.mocked( apiFetch ).mockImplementation( respond );
		const toolProvider = createToolProvider();

		await expect(
			withBlockEditCorrections( toolProvider ).executeAbility( 'big-sky/apply-block-edits', edits )
		).resolves.toEqual( { result, returnToAgent: true } );
		expect( toolProvider.executeAbility ).not.toHaveBeenCalledWith(
			'big-sky/apply-block-edits',
			expect.anything()
		);
	} );

	it( "applies the edits as sent where the site doesn't serve the corrections", async () => {
		vi.mocked( apiFetch ).mockRejectedValue( { code: 'rest_ability_not_found' } );
		const toolProvider = createToolProvider();

		await withBlockEditCorrections( toolProvider ).executeAbility( 'big-sky/apply-block-edits', {
			...edits,
			reverseMap,
		} );

		expect( toolProvider.executeAbility ).toHaveBeenLastCalledWith( 'big-sky/apply-block-edits', {
			...edits,
			reverseMap,
		} );
	} );

	it( 'returns a failed block tree read without correcting or applying the edits', async () => {
		const treeError = {
			result: { success: false, message: 'Unable to read.', error: 'No store.' },
		};
		const toolProvider = createToolProvider();
		vi.mocked( toolProvider.executeAbility ).mockResolvedValueOnce( treeError );

		await expect(
			withBlockEditCorrections( toolProvider ).executeAbility( 'big-sky/apply-block-edits', edits )
		).resolves.toBe( treeError );
		expect( apiFetch ).not.toHaveBeenCalled();
		expect( toolProvider.executeAbility ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'runs other abilities directly', async () => {
		const toolProvider = createToolProvider();

		await withBlockEditCorrections( toolProvider ).executeAbility( 'big-sky/set-site-logo', {} );

		expect( apiFetch ).not.toHaveBeenCalled();
		expect( toolProvider.executeAbility ).toHaveBeenCalledWith( 'big-sky/set-site-logo', {} );
	} );
} );
