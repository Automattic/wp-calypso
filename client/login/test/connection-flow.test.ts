import { getConnectionFlowFromRedirectTo } from '../connection-flow';

describe( 'getConnectionFlowFromRedirectTo', () => {
	it( 'flags the connector flow and parses plugins when from=jetpack-connector', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack,woocommerce'
		);

		expect( params ).toEqual( {
			isUnifiedConnectionFlow: true,
			connectorPlugins: [ 'jetpack', 'woocommerce' ],
		} );
	} );

	it.each( [
		'jetpack-onboarding',
		'jetpack_premium_analytics_onboarding',
		'delete_connection_owner_notice',
	] )( 'flags the connector flow and parses plugins for from=%s', ( from ) => {
		const params = getConnectionFlowFromRedirectTo(
			`/jetpack/connect/authorize?from=${ from }&plugins=jetpack-premium-analytics`
		);

		expect( params ).toEqual( {
			isUnifiedConnectionFlow: true,
			connectorPlugins: [ 'jetpack-premium-analytics' ],
		} );
	} );

	it.each( [ 'jetpack-onboarding-wizard', 'jetpack-newsletter', 'jetpack-x_y' ] )(
		'treats the legacy value %s as outside the unified flow',
		( from ) => {
			const params = getConnectionFlowFromRedirectTo(
				`/jetpack/connect/authorize?from=${ from }&plugins=jetpack`
			);

			expect( params ).toEqual( {
				isUnifiedConnectionFlow: false,
				connectorPlugins: [],
			} );
		}
	);

	it( 'does not flag the connector for unrelated from values and ignores plugins', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=my-jetpack&plugins=jetpack,woocommerce'
		);

		expect( params.isUnifiedConnectionFlow ).toBe( false );
		expect( params.connectorPlugins ).toEqual( [] );
	} );

	it( 'falls back to currentQuery.from when redirect_to does not carry from', () => {
		const params = getConnectionFlowFromRedirectTo( '/jetpack/connect/authorize', {
			from: 'jetpack-connector',
			plugins: 'jetpack,woocommerce',
		} );

		expect( params.isUnifiedConnectionFlow ).toBe( true );
		expect( params.connectorPlugins ).toEqual( [ 'jetpack', 'woocommerce' ] );
	} );

	it( 'prefers redirect_to over currentQuery for from and plugins when both are present', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack',
			{ from: 'my-jetpack', plugins: 'woocommerce' }
		);

		expect( params.isUnifiedConnectionFlow ).toBe( true );
		expect( params.connectorPlugins ).toEqual( [ 'jetpack' ] );
	} );

	it( 'trims whitespace inside the plugins list', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack,%20woocommerce'
		);

		expect( params.connectorPlugins ).toEqual( [ 'jetpack', 'woocommerce' ] );
	} );

	it( 'returns an empty plugin list when the plugins query param is absent', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector'
		);

		expect( params.isUnifiedConnectionFlow ).toBe( true );
		expect( params.connectorPlugins ).toEqual( [] );
	} );

	it( 'returns sensible defaults when redirect_to is missing', () => {
		expect( getConnectionFlowFromRedirectTo( undefined ) ).toEqual( {
			isUnifiedConnectionFlow: false,
			connectorPlugins: [],
		} );
	} );

	it( 'returns sensible defaults when the current query is null', () => {
		expect( getConnectionFlowFromRedirectTo( '/jetpack/connect/authorize', null ) ).toEqual( {
			isUnifiedConnectionFlow: false,
			connectorPlugins: [],
		} );
	} );

	it( 'filters empty entries produced by trailing commas in plugins', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack,,woocommerce,'
		);

		expect( params.connectorPlugins ).toEqual( [ 'jetpack', 'woocommerce' ] );
	} );
} );
