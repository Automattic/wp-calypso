import { resolveVisitAreaSlug } from '../visit-areas';

describe( 'resolveVisitAreaSlug', () => {
	test.each( [
		[ '/sites', 'sites-list' ],
		[ '/sites/', 'sites-list' ],
		[ '/sites/example.com', 'site-overview' ],
		[ '/sites/example.com/', 'site-overview' ],
		[ '/sites/example.com/deployments', 'deployments' ],
		[ '/sites/example.com/deployments/manage/123', 'deployments' ],
		[ '/sites/example.com/monitoring', 'logs-monitoring' ],
		[ '/sites/example.com/logs', 'logs-monitoring' ],
		[ '/sites/example.com/logs/php', 'logs-monitoring' ],
		[ '/sites/example.com/logs/server', 'logs-monitoring' ],
		[ '/sites/example.com/backups', 'backups-activity' ],
		[ '/sites/example.com/backups/123/restore', 'backups-activity' ],
		[ '/sites/example.com/performance', 'performance' ],
		[ '/sites/example.com/performance/backend/database', 'performance' ],
		[ '/domains', 'domains' ],
		[ '/domains/example.com/dns', 'domains' ],
		[ '/emails', 'emails' ],
		[ '/emails/choose-domain', 'emails' ],
		[ '/me', 'account' ],
		[ '/me/billing/purchases', 'account' ],
	] )( 'maps %s to %s', ( pathname, expected ) => {
		expect( resolveVisitAreaSlug( pathname ) ).toBe( expected );
	} );

	test( 'resolves logs/activity to backups-activity, not logs-monitoring', () => {
		expect( resolveVisitAreaSlug( '/sites/example.com/logs/activity' ) ).toBe( 'backups-activity' );
	} );

	test.each( [
		[ '/newproduct/sites', '/newproduct', 'sites-list' ],
		[ '/newproduct/sites/example.com/deployments', '/newproduct', 'deployments' ],
		[ '/newproduct/domains', 'newproduct', 'domains' ],
		[ '/sites', '/', 'sites-list' ],
	] )( 'strips basePath %s (%s)', ( pathname, basePath, expected ) => {
		expect( resolveVisitAreaSlug( pathname, basePath ) ).toBe( expected );
	} );

	test.each( [
		[ '/sites/example.com/settings/sftp-ssh' ],
		[ '/sites/example.com/settings/php' ],
		[ '/sites/example.com/settings/database' ],
		[ '/sites/example.com/settings/caching' ],
	] )( 'maps hosting setting %s to server-config', ( pathname ) => {
		expect( resolveVisitAreaSlug( pathname ) ).toBe( 'server-config' );
	} );

	test.each( [
		[ '/sites/example.com/settings' ],
		[ '/sites/example.com/settings/wordpress' ],
		[ '/sites/example.com/scan' ],
		[ '/sites/example.com/plans' ],
		[ '/' ],
		[ '/reader' ],
	] )( 'returns null for untracked path %s', ( pathname ) => {
		expect( resolveVisitAreaSlug( pathname ) ).toBeNull();
	} );
} );
