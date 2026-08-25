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
	/**
	 * The customer has a WordPress.com session, not one on their Atomic site.
	 * Sending them straight to wp-admin showed them a login form for the site
	 * they had just made, so the hand-off goes through Jetpack SSO.
	 */
	it( 'routes through Jetpack SSO so they arrive logged in', () => {
		const url = getSiteEditorUrl( 'https://example.com/wp-admin/' );

		expect( url ).toContain( 'https://example.com/wp-login.php' );
		expect( url ).toContain( encodeURIComponent( '/wp-admin/site-editor.php' ) );
	} );

	/**
	 * Jetpack only saves the jetpack_sso_redirect_to cookie — the sole carrier
	 * of the destination across the WordPress.com round trip — on the plain
	 * login path. A direct action=jetpack-sso entry skips save_cookies() and
	 * the return leg falls back to /wp-admin, dropping the deep link.
	 */
	it( 'uses the plain login path so the redirect survives the SSO round trip', () => {
		expect( getSiteEditorUrl( 'https://example.com/wp-admin/' ) ).not.toContain(
			'action=jetpack-sso'
		);
	} );

	it( 'tolerates an admin URL without a trailing slash', () => {
		expect( getSiteEditorUrl( 'https://example.com/wp-admin' ) ).toContain(
			encodeURIComponent( '/wp-admin/site-editor.php' )
		);
	} );

	/**
	 * SSO lives on the site's own host; a *.wordpress.com address is the
	 * WordPress.com side of an Atomic site, and signing in there does not produce
	 * a session for wp-admin.
	 */
	it( 'signs in on the site host rather than the WordPress.com one', () => {
		const url = getSiteEditorUrl( 'https://example.wordpress.com/wp-admin/' );

		expect( url ).toContain( 'https://example.wpcomstaging.com/wp-login.php' );
	} );

	/**
	 * A relative redirect cannot be pointed off-site.
	 */
	it( 'keeps the redirect relative', () => {
		const url = getSiteEditorUrl( 'https://example.com/wp-admin/', {
			startWalkthrough: true,
		} );
		const redirect = new URL( url ).searchParams.get( 'redirect_to' );

		expect( redirect ).toBe( '/wp-admin/site-editor.php?blueprint-walkthrough=go&canvas=edit' );
	} );

	/**
	 * The flag is how Big Sky knows to open the copy walkthrough instead of
	 * waiting for the customer to speak first.
	 */
	it( 'flags the walkthrough when the spec was applied', () => {
		expect(
			getSiteEditorUrl( 'https://example.com/wp-admin/', { startWalkthrough: true } )
		).toContain( encodeURIComponent( 'blueprint-walkthrough=go' ) );
	} );

	/**
	 * Big Sky's assembler only mounts on the editing canvas; a plain
	 * site-editor.php load stays in view mode and the walkthrough silently
	 * never starts. The hand-off must force edit mode.
	 */
	it( 'forces the editing canvas so Big Sky mounts', () => {
		expect(
			getSiteEditorUrl( 'https://example.com/wp-admin/', { startWalkthrough: true } )
		).toContain( encodeURIComponent( 'canvas=edit' ) );
	} );

	it( 'leaves the flag off when the spec did not apply', () => {
		expect(
			getSiteEditorUrl( 'https://example.com/wp-admin/', { startWalkthrough: false } )
		).not.toContain( 'blueprint-walkthrough' );
	} );
} );
