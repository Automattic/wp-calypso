import { select } from '@wordpress/data';
import { type Mock, vi } from 'vitest';
import { getEditorStateCallback } from '../callback';

vi.mock( '@wordpress/data', () => ( { select: vi.fn() } ) );

const mockedSelect = select as Mock;

function mockStores( postId: number | undefined ) {
	const stores: Record< string, unknown > = {
		'core/editor': {
			getCurrentPostId: () => postId,
			getCurrentPostType: () => 'page',
			getEditedPostAttribute: ( attribute: string ) => ( attribute === 'title' ? 'About' : '' ),
			getCurrentPostAttribute: ( attribute: string ) =>
				attribute === 'status' ? 'publish' : undefined,
		},
		core: {
			__experimentalGetDirtyEntityRecords: () => [
				{ kind: 'postType', name: 'page', key: 12, title: 'About' },
				{ kind: 'postType', name: 'wp_template_part', key: 'theme//header', title: 'Header' },
				{ kind: 'root', name: 'site', title: 'Site' },
			],
		},
	};

	mockedSelect.mockImplementation( ( store: string ) => stores[ store ] );
}

describe( 'getEditorStateCallback', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'returns the open post with its saved status, and every unsaved record', () => {
		mockStores( 12 );

		expect( getEditorStateCallback() ).toEqual( {
			result: {
				success: true,
				message: 'Read the editor state.',
				details: {
					open: { id: 12, type: 'page', title: 'About', status: 'publish' },
					unsavedChanges: [
						{ type: 'page', id: 12, title: 'About' },
						{ type: 'wp_template_part', id: 'theme//header', title: 'Header' },
						{ type: 'site', id: undefined, title: 'Site' },
					],
				},
			},
			returnToAgent: true,
		} );
	} );

	it( 'still lists the unsaved records when the editor has nothing open', () => {
		mockStores( undefined );

		expect( getEditorStateCallback().result.details ).toEqual( {
			open: null,
			unsavedChanges: expect.arrayContaining( [ { type: 'page', id: 12, title: 'About' } ] ),
		} );
	} );
} );
