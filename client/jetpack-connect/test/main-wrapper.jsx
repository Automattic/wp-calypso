/**
 * @jest-environment jsdom
 */

import { render, within } from '@testing-library/react';
import { JetpackConnectMainWrapper } from '../main-wrapper';

jest.mock( 'calypso/components/data/document-head', () => () => 'DocumentHead' );

describe( 'JetpackConnectMainWrapper', () => {
	const translate = ( string ) => string;

	test( 'should render the passed children as children of the component', () => {
		const { container } = render(
			<JetpackConnectMainWrapper translate={ translate }>
				<span data-testid="test__child" />
			</JetpackConnectMainWrapper>
		);

		expect( within( container.firstChild ).getByTestId( 'test__child' ) ).toBeVisible();
	} );

	test( 'should always specify the jetpack-connect__main class', () => {
		const { container } = render( <JetpackConnectMainWrapper translate={ translate } /> );

		expect( container.firstChild ).toHaveClass( 'jetpack-connect__main' );
	} );

	test( 'should allow more classes to be added', () => {
		const { container } = render(
			<JetpackConnectMainWrapper className="test__class" translate={ translate } />
		);

		expect( container.firstChild ).toHaveClass( 'jetpack-connect__main' );
		expect( container.firstChild ).toHaveClass( 'test__class' );
	} );

	test( 'should not contain the is-wide modifier class by default', () => {
		const { container } = render( <JetpackConnectMainWrapper translate={ translate } /> );

		expect( container.firstChild ).not.toHaveClass( 'is-wide' );
	} );

	test( 'should contain the is-wide modifier class if prop is specified', () => {
		const { container } = render( <JetpackConnectMainWrapper isWide translate={ translate } /> );

		expect( container.firstChild ).toHaveClass( 'is-wide' );
	} );

	test( 'should not contain the is-mobile-app-flow modifier class by default', () => {
		const { container } = render( <JetpackConnectMainWrapper translate={ translate } /> );

		expect( container.firstChild ).not.toHaveClass( 'is-mobile-app-flow' );
	} );

	test( 'should contain the is-mobile-app-flow modifier if cookie is set', () => {
		document.cookie = 'jetpack_connect_mobile_redirect=some url';
		const { container } = render( <JetpackConnectMainWrapper isWide translate={ translate } /> );

		expect( container.firstChild ).toHaveClass( 'is-mobile-app-flow' );
	} );
} );
