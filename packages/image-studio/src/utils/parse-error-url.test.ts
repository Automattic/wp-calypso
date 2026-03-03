import { parseErrorUrl } from './parse-error-url';

describe( 'parseErrorUrl', () => {
	describe( 'Streaming error prefix stripping', () => {
		it( 'strips "Streaming error: " prefix', () => {
			const result = parseErrorUrl( 'Streaming error: Something went wrong.' );
			expect( result.content ).toBe( 'Something went wrong.' );
		} );

		it( 'strips prefix case-insensitively', () => {
			const result = parseErrorUrl( 'streaming error: Something went wrong.' );
			expect( result.content ).toBe( 'Something went wrong.' );
		} );

		it( 'strips prefix and extracts upgrade URL', () => {
			const result = parseErrorUrl(
				'Streaming error: Congratulations on exploring Image Studio and reaching the free requests limit! Upgrade now to keep using it. https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge'
			);
			expect( result.content ).toBe(
				'Congratulations on exploring Image Studio and reaching the free requests limit! Upgrade now to keep using it.'
			);
			expect( result.isUpgradeUrl ).toBe( true );
		} );

		it( 'does not strip prefix mid-message', () => {
			const result = parseErrorUrl( 'There was a Streaming error: in the pipeline.' );
			expect( result.content ).toBe( 'There was a Streaming error: in the pipeline.' );
		} );
	} );

	describe( 'no URL present', () => {
		it( 'returns original content when no URL', () => {
			const result = parseErrorUrl( 'An error occurred.' );
			expect( result ).toEqual( {
				content: 'An error occurred.',
				url: null,
				isUpgradeUrl: false,
				isPlansPageUrl: false,
			} );
		} );

		it( 'returns empty string for empty input', () => {
			const result = parseErrorUrl( '' );
			expect( result ).toEqual( {
				content: '',
				url: null,
				isUpgradeUrl: false,
				isPlansPageUrl: false,
			} );
		} );
	} );

	describe( 'URL extraction', () => {
		it( 'extracts http URL from message', () => {
			const result = parseErrorUrl( 'Error occurred. See http://example.com for details.' );
			expect( result.url ).toBe( 'http://example.com' );
			expect( result.content ).toBe( 'Error occurred. See for details.' );
		} );

		it( 'extracts https URL from message', () => {
			const result = parseErrorUrl( 'Error occurred. See https://example.com for details.' );
			expect( result.url ).toBe( 'https://example.com' );
			expect( result.content ).toBe( 'Error occurred. See for details.' );
		} );

		it( 'extracts URL with path and query params', () => {
			const result = parseErrorUrl( 'Visit https://example.com/path?foo=bar&baz=qux' );
			expect( result.url ).toBe( 'https://example.com/path?foo=bar&baz=qux' );
			expect( result.content ).toBe( 'Visit' );
		} );

		it( 'extracts first URL when multiple present', () => {
			const result = parseErrorUrl( 'See https://first.com or https://second.com' );
			expect( result.url ).toBe( 'https://first.com' );
		} );

		it( 'trims content after URL removal', () => {
			const result = parseErrorUrl( 'https://example.com' );
			expect( result.content ).toBe( '' );
		} );

		it( 'handles URL at start of message', () => {
			const result = parseErrorUrl( 'https://example.com - click here for help' );
			expect( result.url ).toBe( 'https://example.com' );
			expect( result.content ).toBe( '- click here for help' );
		} );

		it( 'handles URL at end of message', () => {
			const result = parseErrorUrl( 'For more information visit https://example.com' );
			expect( result.url ).toBe( 'https://example.com' );
			expect( result.content ).toBe( 'For more information visit' );
		} );
	} );

	describe( 'upgrade URL detection', () => {
		it( 'identifies /plans/ URL as upgrade and plans page', () => {
			const result = parseErrorUrl( 'Upgrade required https://wordpress.com/plans/example.com' );
			expect( result.isUpgradeUrl ).toBe( true );
			expect( result.isPlansPageUrl ).toBe( true );
		} );

		it( 'identifies /upgrade URL as upgrade but not plans page', () => {
			const result = parseErrorUrl( 'Upgrade required https://wordpress.com/upgrade' );
			expect( result.isUpgradeUrl ).toBe( true );
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'identifies /upgrade/ with path as upgrade but not plans page', () => {
			const result = parseErrorUrl( 'See https://example.com/upgrade/premium' );
			expect( result.isUpgradeUrl ).toBe( true );
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'identifies jetpack.com/redirect URL as upgrade but not plans page', () => {
			const result = parseErrorUrl(
				'Upgrade required https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge&site=example.com'
			);
			expect( result.isUpgradeUrl ).toBe( true );
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'identifies my-jetpack URL as upgrade but not plans page', () => {
			const result = parseErrorUrl(
				'Upgrade required https://example.com/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai'
			);
			expect( result.isUpgradeUrl ).toBe( true );
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'returns false for non-upgrade URLs', () => {
			const result = parseErrorUrl( 'See https://example.com/help' );
			expect( result.isUpgradeUrl ).toBe( false );
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'returns false for URL with "plans" not in path', () => {
			const result = parseErrorUrl( 'See https://example.com?plans=true' );
			expect( result.isUpgradeUrl ).toBe( false );
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'returns false for URL with "upgrade" in domain', () => {
			const result = parseErrorUrl( 'See https://upgrade.example.com' );
			expect( result.isUpgradeUrl ).toBe( false );
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'returns false for URL with "jetpack.com/redirect" in path but different hostname', () => {
			const result = parseErrorUrl( 'See https://evil.com/jetpack.com/redirect' );
			expect( result.isUpgradeUrl ).toBe( false );
			expect( result.isPlansPageUrl ).toBe( false );
		} );
	} );

	describe( 'isPlansPageUrl detection', () => {
		it( 'identifies /plans/ URL as plans page', () => {
			const result = parseErrorUrl( 'Upgrade required https://wordpress.com/plans/example.com' );
			expect( result.isPlansPageUrl ).toBe( true );
		} );

		it( 'returns false for Jetpack redirect URL', () => {
			const result = parseErrorUrl(
				'Upgrade required https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge&site=example.com'
			);
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'returns false for my-jetpack URL', () => {
			const result = parseErrorUrl(
				'Upgrade required https://example.com/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai'
			);
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'returns false for /upgrade URL', () => {
			const result = parseErrorUrl( 'Upgrade required https://wordpress.com/upgrade' );
			expect( result.isPlansPageUrl ).toBe( false );
		} );

		it( 'returns false for non-upgrade URLs', () => {
			const result = parseErrorUrl( 'See https://example.com/help' );
			expect( result.isPlansPageUrl ).toBe( false );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'handles URL with fragment', () => {
			const result = parseErrorUrl( 'See https://example.com/docs#section' );
			expect( result.url ).toBe( 'https://example.com/docs#section' );
		} );

		it( 'handles URL with port', () => {
			const result = parseErrorUrl( 'See https://example.com:8080/path' );
			expect( result.url ).toBe( 'https://example.com:8080/path' );
		} );

		it( 'handles URL with encoded characters', () => {
			const result = parseErrorUrl( 'See https://example.com/path%20with%20spaces' );
			expect( result.url ).toBe( 'https://example.com/path%20with%20spaces' );
		} );

		it( 'does not match ftp URLs', () => {
			const result = parseErrorUrl( 'See ftp://example.com' );
			expect( result.url ).toBeNull();
		} );

		it( 'does not match mailto links', () => {
			const result = parseErrorUrl( 'Contact mailto:test@example.com' );
			expect( result.url ).toBeNull();
		} );
	} );
} );
