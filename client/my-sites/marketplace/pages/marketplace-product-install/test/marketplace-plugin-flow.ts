import { isMarketplacePluginActivationFlow } from '../marketplace-plugin-flow';

type Args = Parameters< typeof isMarketplacePluginActivationFlow >[ 0 ];

const defaults: Args = {
	atomicFlow: false,
	isPluginUploadFlow: false,
	pluginSlug: 'sensei-pro',
	freshSite: { is_wpcom_atomic: true },
	wporgPlugin: { wporg: false },
};

const flow = ( overrides?: Partial< Args > ) =>
	isMarketplacePluginActivationFlow( { ...defaults, ...overrides } );

describe( 'isMarketplacePluginActivationFlow', () => {
	it( 'detects a checkout-initiated marketplace plugin once the site is Atomic', () => {
		expect( flow() ).toBe( true );
	} );

	it( 'is not the flow before the site is Atomic', () => {
		expect( flow( { freshSite: { is_wpcom_atomic: false } } ) ).toBe( false );
		expect( flow( { freshSite: null } ) ).toBe( false );
		expect( flow( { freshSite: undefined } ) ).toBe( false );
	} );

	it( 'excludes the atomic-transfer and plugin-upload flows this component drives itself', () => {
		expect( flow( { atomicFlow: true } ) ).toBe( false );
		expect( flow( { isPluginUploadFlow: true } ) ).toBe( false );
	} );

	it( 'requires a plugin slug and a marketplace (not .org-directory) plugin', () => {
		expect( flow( { pluginSlug: '' } ) ).toBe( false );
		expect( flow( { wporgPlugin: { wporg: true } } ) ).toBe( false );
		expect( flow( { wporgPlugin: null } ) ).toBe( false );
	} );
} );
