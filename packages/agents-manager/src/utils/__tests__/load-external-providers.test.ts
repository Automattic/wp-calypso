import { mergeCapabilitiesInto, type ProviderCapabilities } from '../load-external-providers';

describe( 'mergeCapabilitiesInto', () => {
	it( 'is a no-op when capabilities is undefined', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, undefined );
		expect( merged ).toEqual( {} );
	} );

	it( 'is a no-op when capabilities is null or not an object', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, null );
		mergeCapabilitiesInto( merged, 'oops' );
		mergeCapabilitiesInto( merged, 42 );
		expect( merged ).toEqual( {} );
	} );

	it( 'sets supportsSplitScreen when the provider declares it', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, { supportsSplitScreen: true } );
		expect( merged.supportsSplitScreen ).toBe( true );
	} );

	it( 'leaves supportsSplitScreen unset when the provider declares false', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, { supportsSplitScreen: false } );
		expect( merged.supportsSplitScreen ).toBeUndefined();
	} );

	it( 'rejects truthy non-boolean values (untyped runtime modules)', () => {
		const merged: ProviderCapabilities = {};
		// A misconfigured external module exporting a stringified flag must not
		// silently opt in via JavaScript truthiness.
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 'false' } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 'true' } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 1 } );
		expect( merged.supportsSplitScreen ).toBeUndefined();
	} );

	it( 'OR-merges across providers — any true wins', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, { supportsSplitScreen: false } );
		mergeCapabilitiesInto( merged, {} );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: true } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: false } );
		expect( merged.supportsSplitScreen ).toBe( true );
	} );

	it( 'reads capabilities via property access (Proxy-safe)', () => {
		// Mirrors the lazy proxy shape used by jetpack-ai-sidebar.provider.mjs.
		// Object.entries() on this Proxy returns [], so the function must
		// probe each known key by direct access to hit the get trap.
		const lazyCapabilities = new Proxy(
			{},
			{ get: ( _target, prop ) => ( prop === 'supportsSplitScreen' ? true : undefined ) }
		);
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, lazyCapabilities );
		expect( merged.supportsSplitScreen ).toBe( true );
	} );
} );
