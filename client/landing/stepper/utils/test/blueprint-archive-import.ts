/**
 * @jest-environment jsdom
 */
import wpcom from 'calypso/lib/wp';
import {
	applyBlueprintSpec,
	getSiteEditorUrl,
	getStandaloneBlueprintArchiveSlug,
} from '../blueprint-archive-import';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
} ) );

const mockPost = wpcom.req.post as jest.Mock;

describe( 'getStandaloneBlueprintArchiveSlug', () => {
	it( 'returns the Blueprint archive slug for a standalone build_dest=wow flow', () => {
		expect( getStandaloneBlueprintArchiveSlug( 'coaching-1', null, 'wow' ) ).toBe( 'coaching-1' );
	} );

	it( 'ignores Blueprint values without build_dest=wow', () => {
		expect( getStandaloneBlueprintArchiveSlug( '945', null, null ) ).toBeNull();
	} );

	it( 'ignores retained Blueprint values after a Playground ID exists', () => {
		expect( getStandaloneBlueprintArchiveSlug( '945', 'playground-uuid', null ) ).toBeNull();
		expect( getStandaloneBlueprintArchiveSlug( '945', 'playground-uuid', 'wow' ) ).toBeNull();
	} );
} );

describe( 'applyBlueprintSpec', () => {
	beforeEach( () => {
		mockPost.mockReset();
	} );

	it( 'posts the spec and blueprint to the apply endpoint', async () => {
		mockPost.mockResolvedValue( { success: true } );

		await expect(
			applyBlueprintSpec( 'example.wordpress.com', 'spec-123', 'coachava' )
		).resolves.toBe( true );

		expect( mockPost ).toHaveBeenCalledWith(
			{
				path: '/sites/example.wordpress.com/big-sky/apply-blueprint-spec',
				apiNamespace: 'wpcom/v2',
			},
			{ spec_id: 'spec-123', blueprint_id: 'coachava' }
		);
	} );

	it( 'omits the blueprint when one is not known', async () => {
		mockPost.mockResolvedValue( { success: true } );

		await applyBlueprintSpec( '12345', 'spec-123' );

		expect( mockPost ).toHaveBeenCalledWith( expect.anything(), { spec_id: 'spec-123' } );
	} );

	it( 'skips the request without a spec id', async () => {
		await expect( applyBlueprintSpec( '12345', '' ) ).resolves.toBe( false );

		expect( mockPost ).not.toHaveBeenCalled();
	} );

	/**
	 * Personalization is a bonus on top of a site the user already paid for, so a
	 * failure here must never propagate and block the hand-off to the editor.
	 */
	it( 'resolves false instead of throwing when the request fails', async () => {
		mockPost.mockRejectedValue( new Error( 'nope' ) );

		await expect( applyBlueprintSpec( '12345', 'spec-123', 'coachava' ) ).resolves.toBe( false );
	} );
} );

describe( 'getSiteEditorUrl', () => {
	it( 'returns a plain site editor URL by default', () => {
		expect( getSiteEditorUrl( 'https://example.com/wp-admin/' ) ).toBe(
			'https://example.com/wp-admin/site-editor.php'
		);
	} );

	it( 'tolerates an admin URL without a trailing slash', () => {
		expect( getSiteEditorUrl( 'https://example.com/wp-admin' ) ).toBe(
			'https://example.com/wp-admin/site-editor.php'
		);
	} );

	/**
	 * The flag is how Big Sky knows to open the copy walkthrough instead of
	 * waiting for the customer to speak first.
	 */
	it( 'flags the walkthrough when the spec was applied', () => {
		expect( getSiteEditorUrl( 'https://example.com/wp-admin/', { startWalkthrough: true } ) ).toBe(
			'https://example.com/wp-admin/site-editor.php?blueprint-walkthrough=1'
		);
	} );

	it( 'leaves the flag off when the spec did not apply', () => {
		expect(
			getSiteEditorUrl( 'https://example.com/wp-admin/', { startWalkthrough: false } )
		).not.toContain( 'blueprint-walkthrough' );
	} );
} );
