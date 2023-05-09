import deepFreeze from 'deep-freeze';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';

const helloDolly = {
	id: 'hello-dolly/hello',
	slug: 'hello-dolly',
	active: false,
};

const jetpack = {
	id: 'jetpack/jetpack',
	slug: 'jetpack',
	active: true,
};

const state = deepFreeze( {
	plugins: {
		installed: {
			plugins: {
				'site.one': [ helloDolly ],
				'site.two': [ jetpack, helloDolly ],
			},
		},
	},
} );

describe( 'isPluginActive', () => {
	test( 'should return false if the site cannot be found', () => {
		expect( isPluginActive( state, 'some-unknown-id', 'my-slug' ) ).toBe( false );
	} );

	test( 'should return false if the plugin cannot be found', () => {
		expect( isPluginActive( state, 'site.two', 'some-non-existant-slug' ) ).toBe( false );
	} );

	test( 'should return false if the plugin is found, but not active', () => {
		expect( isPluginActive( state, 'site.two', 'hello-dolly' ) ).toBe( false );
	} );

	test( 'should return true if the plugin is found and is active', () => {
		expect( isPluginActive( state, 'site.two', 'jetpack' ) ).toBe( true );
	} );
} );
