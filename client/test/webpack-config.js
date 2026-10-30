describe( 'client webpack config', () => {
	const originalEnv = process.env;

	beforeEach( () => {
		jest.resetModules();
		process.env = { ...originalEnv };
		delete process.env.CIRCLECI;
		delete process.env.CONCURRENT_BUILDS;
	} );

	afterEach( () => {
		process.env = originalEnv;
	} );

	// Minimizers default to one worker per CPU the host reports, which inside Docker is every
	// host CPU (e.g. 127 workers on a 128-CPU build host), regardless of WORKERS.
	test.each( [ 2, 12 ] )( 'sizes minimizer worker pools from WORKERS=%i', ( workers ) => {
		process.env.WORKERS = String( workers );

		const config = require( '../webpack.config' );

		const pools = Object.fromEntries(
			config.optimization.minimizer.map( ( plugin ) => [
				plugin.constructor.name,
				plugin.options.parallel,
			] )
		);
		expect( pools ).toEqual( { TerserPlugin: workers, CssMinimizerPlugin: workers } );
	} );
} );
