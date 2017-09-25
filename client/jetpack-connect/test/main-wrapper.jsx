/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackConnectMainWrapper from '../main-wrapper';
import Main from 'components/main';

describe( 'JetpackConnectMainWrapper', () => {
	it( 'should render a <Main> instance', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper /> );

		expect( wrapper.find( Main ) ).to.have.length( 1 );
	} );

	it( 'should render the passed children as children of the component', () => {
		const wrapper = shallow(
			<JetpackConnectMainWrapper>
				<span className="test__child" />
			</JetpackConnectMainWrapper>
		).render();

		expect( wrapper.find( '.test__child' ) ).to.have.length( 1 );
	} );

	it( 'should always specify the jetpack-connect__main class', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper /> );

		expect( wrapper.hasClass( 'jetpack-connect__main' ) ).to.be.true;
	} );

	it( 'should allow more classes to be added', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper className="test__class" /> );

		expect( wrapper.hasClass( 'jetpack-connect__main' ) ).to.be.true;
		expect( wrapper.hasClass( 'test__class' ) ).to.be.true;
	} );

	it( 'should not contain the is-wide modifier class by default', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper /> );

		expect( wrapper.hasClass( 'is-wide' ) ).to.be.false;
	} );

	it( 'should contain the is-wide modifier class if prop is specified', () => {
		const wrapper = shallow( <JetpackConnectMainWrapper isWide /> );

		expect( wrapper.hasClass( 'is-wide' ) ).to.be.true;
	} );
} );
