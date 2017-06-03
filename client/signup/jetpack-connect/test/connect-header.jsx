/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import JetpackConnectHeader from '../connect-header';
import StepHeader from '../../step-header';

describe( 'JetpackConnectHeader', () => {
	it( 'should render a div.jetpack-connect__header-container wrapper element', () => {
		const wrapper = shallow(
			<JetpackConnectHeader />
		);

		expect( wrapper.is( 'div' ) ).to.be.true;
		expect( wrapper.hasClass( 'jetpack-connect__header-container' ) ).to.be.true;
	} );

	it( 'should contain a jetpack logo if showLogo is not specified', () => {
		const wrapper = shallow(
			<JetpackConnectHeader />
		);

		expect( wrapper.find( 'img' ) ).to.have.length( 1 );
	} );

	it( 'should contain a jetpack logo if showLogo is true', () => {
		const wrapper = shallow(
			<JetpackConnectHeader showLogo />
		);

		expect( wrapper.find( 'img' ) ).to.have.length( 1 );
	} );

	it( 'should not contain a jetpack logo if showLogo is false', () => {
		const wrapper = shallow(
			<JetpackConnectHeader showLogo={ false } />
		);

		expect( wrapper.find( 'img' ) ).to.have.length( 0 );
	} );

	it( 'should contain a certain logo with a specific size and class', () => {
		const wrapper = shallow(
			<JetpackConnectHeader showLogo />
		);

		const props = wrapper.find( 'img' ).props();

		expect( props ).to.have.property( 'className', 'jetpack-connect__jetpack-logo' );
		expect( props ).to.have.property( 'src', '/calypso/images/jetpack/jetpack-logo.svg' );
		expect( props ).to.have.property( 'width', 18 );
		expect( props ).to.have.property( 'height', 18 );
	} );

	it( 'should contain a SiteHeader', () => {
		const wrapper = shallow(
			<JetpackConnectHeader />
		);

		expect( wrapper.find( StepHeader ) ).to.have.length( 1 );
	} );

	it( 'should pass all props to the SiteHeader, including the default props', () => {
		const wrapper = shallow(
			<JetpackConnectHeader bar="bat" />
		);

		expect( wrapper.find( StepHeader ).props() ).to.eql( {
			showLogo: true,
			label: '',
			bar: 'bat'
		} );
	} );
} );
