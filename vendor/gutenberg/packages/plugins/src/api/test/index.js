/**
 * Internal dependencies
 */
import {
	registerPlugin,
	unregisterPlugin,
	getPlugin,
	getPlugins,
} from '../';

describe( 'registerPlugin', () => {
	afterEach( () => {
		getPlugins().forEach( ( plugin ) => {
			unregisterPlugin( plugin.name );
		} );
	} );

	it( 'successfully registers a plugin', () => {
		const name = 'plugin';
		const icon = 'smiley';
		const Component = () => 'plugin content';

		registerPlugin( name, {
			render: Component,
			icon,
		} );

		expect( getPlugin( name ) ).toEqual( {
			name,
			render: Component,
			icon,
		} );
	} );

	it( 'fails to register a plugin without a settings object', () => {
		registerPlugin();
		expect( console ).toHaveErroredWith( 'No settings object provided!' );
	} );

	it( 'fails to register a plugin with special character in the name', () => {
		registerPlugin( 'plugin/with/special/characters', {
			render: () => {},
		} );
		expect( console ).toHaveErroredWith( 'Plugin names must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: "my-plugin".' );
	} );

	it( 'fails to register a plugin with a non-string name', () => {
		registerPlugin( {}, {
			render: () => {},
		} );
		expect( console ).toHaveErroredWith( 'Plugin names must be strings.' );
	} );

	it( 'fails to register a plugin without a render function', () => {
		registerPlugin( 'another-plugin', {} );
		expect( console ).toHaveErroredWith( 'The "render" property must be specified and must be a valid function.' );
	} );

	it( 'fails to register a plugin that was already been registered', () => {
		registerPlugin( 'plugin', {
			render: () => 'plugin content',
		} );
		registerPlugin( 'plugin', {
			render: () => 'plugin content',
		} );
		expect( console ).toHaveErroredWith( 'Plugin "plugin" is already registered.' );
	} );
} );
