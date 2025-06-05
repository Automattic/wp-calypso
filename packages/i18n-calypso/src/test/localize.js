import { Component } from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import i18n, { localize } from '..';

describe( 'localize()', () => {
	it( 'should be named using the variable name of the composed component', () => {
		class MyComponent extends Component {
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

	it( 'should provide translate and locale props to rendered child', () => {
		const renderer = new ShallowRenderer();
		const LocalizedComponent = localize( () => null );

		renderer.render( <LocalizedComponent /> );
		const result = renderer.getRenderOutput();

		expect( result.props.translate ).toBeInstanceOf( Function );
		expect( result.props.locale ).toBe( i18n.getLocaleSlug() );
	} );
} );
