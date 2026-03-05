import { tags, test } from '../../lib/pw-base';

// We might want to re-enable this test for CIAB, so leaving here until EOY.
test.describe( 'Plugins: Browse', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	test.skip( true, 'Entire suite is skipped pending re-evaluation (was describe.skip in Jest)' );

	test( 'skipped placeholder', () => {} );
} );
