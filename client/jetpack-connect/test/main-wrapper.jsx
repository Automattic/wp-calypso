/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/components/data/document-head', () => 'DocumentHead' );

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { JetpackConnectMainWrapper } from '../main-wrapper';
import Main from 'calypso/components/main';

describe( 'JetpackConnectMainWrapper', () => {
	const translate = ( string ) => string;

	test( 'should render a <Main> instance', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper translate={ translate } /> );

		expect( wrapper.find( Main ) ).toHaveLength( 1 );
	} );

	test( 'should render the passed children as children of the component', () => {
		const wrapper = shallow(
			<JetpackConnectMainWrapper translate={ translate }>
				<span className="test__child" />
			</JetpackConnectMainWrapper>
		).render();

		expect( wrapper.find( '.test__child' ) ).toHaveLength( 1 );
	} );

	test( 'should always specify the jetpack-connect__main class', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper translate={ translate } /> );

		expect( wrapper.hasClass( 'jetpack-connect__main' ) ).toBe( true );
	} );

	test( 'should allow more classes to be added', () => {
		const wrapper = shallow(
			<JetpackConnectMainWrapper className="test__class" translate={ translate } />
		);

		expect( wrapper.hasClass( 'jetpack-connect__main' ) ).toBe( true );
		expect( wrapper.hasClass( 'test__class' ) ).toBe( true );
	} );

	test( 'should not contain the is-wide modifier class by default', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper translate={ translate } /> );

		expect( wrapper.hasClass( 'is-wide' ) ).toBe( false );
	} );

	test( 'should contain the is-wide modifier class if prop is specified', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper isWide translate={ translate } /> );

		expect( wrapper.hasClass( 'is-wide' ) ).toBe( true );
	} );

	test( 'should not contain the is-mobile-app-flow modifier class by default', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper translate={ translate } /> );

		expect( wrapper.hasClass( 'is-mobile-app-flow' ) ).toBe( false );
	} );

	test( 'should contain the is-mobile-app-flow modifier if cookie is set', () => {
		document.cookie = 'jetpack_connect_mobile_redirect=some url';
		const wrapper = shallow( <JetpackConnectMainWrapper isWide translate={ translate } /> );

		expect( wrapper.hasClass( 'is-mobile-app-flow' ) ).toBe( true );
	} );
} );
