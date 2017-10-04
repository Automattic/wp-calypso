/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isPluginActive } from '../';

const helloDolly = {
	id: 'hello-dolly/hello',
	slug: 'hello-dolly',
	active: false,
};

export const jetpack = {
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
	it( 'should return false if the site cannot be found', () => {
		expect( isPluginActive( state, 'some-unknown-id', 'my-slug' ) ).to.be.false;
	} );

	it( 'should return false if the plugin cannot be found', () => {
		expect( isPluginActive( state, 'site.two', 'some-non-existant-slug' ) ).to.be.false;
	} );

	it( 'should return false if the plugin is found, but not active', () => {
		expect( isPluginActive( state, 'site.two', 'hello-dolly' ) ).to.be.false;
	} );

	it( 'should return true if the plugin is found and is active', () => {
		expect( isPluginActive( state, 'site.two', 'jetpack' ) ).to.be.true;
	} );
} );
