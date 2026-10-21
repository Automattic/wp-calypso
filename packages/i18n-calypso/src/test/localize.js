/**
 * @jest-environment jsdom
 */

import { act, Component } from 'react';
import { createRoot } from 'react-dom/client';
import i18n, { localize } from '..';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
		const container = document.createElement( 'div' );
		const root = createRoot( container );
		let localizedProps;
		const LocalizedComponent = localize( ( props ) => {
			localizedProps = props;
			return null;
		} );

		act( () => {
			root.render( <LocalizedComponent /> );
		} );

		expect( localizedProps.translate ).toBeInstanceOf( Function );
		expect( localizedProps.locale ).toBe( i18n.getLocaleSlug() );

		act( () => {
			root.unmount();
		} );
	} );
} );
