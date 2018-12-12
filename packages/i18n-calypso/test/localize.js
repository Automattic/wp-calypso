/** @format */

/**
 * External dependencies
 *
 */
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

/**
 * Internal dependencies
 */
import i18n, { localize } from '../src';

describe( 'localize()', () => {
	it( 'should be named using the variable name of the composed component', () => {
		class MyComponent extends React.Component {
			render() {
				return null;
			}
		}

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).toBe( 'Localized(MyComponent)' );
	} );

	it( 'should be named using the displayName of the composed component', () => {
		const MyComponent = () => null;
		MyComponent.displayName = 'MyComponent';

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).toBe( 'Localized(MyComponent)' );
	} );

	it( 'should be named using the name of the composed function component', () => {
		function MyComponent() {
			return null;
		}

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).toBe( 'Localized(MyComponent)' );
	} );

	it( 'should provide translate, moment, locale and numberFormat props to rendered child', () => {
		const renderer = new ShallowRenderer();
		const LocalizedComponent = localize( () => null );

		renderer.render( <LocalizedComponent /> );
		const result = renderer.getRenderOutput();

		expect( result.props.translate ).toBeInstanceOf( Function );
		expect( result.props.moment ).toBeInstanceOf( Function );
		expect( result.props.numberFormat ).toBeInstanceOf( Function );
		expect( result.props.locale ).toBe( i18n.getLocaleSlug() );
	} );
} );
