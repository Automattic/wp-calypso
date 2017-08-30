/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { stub, spy } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'PreviousStepButton', () => {
	const defaultProps = {
		flowName: 'test:flow',
		stepName: 'test:step2',
		positionInFlow: 1,
		signupProgress: [
			{ stepName: 'test:step1', stepSectionName: 'test:section1', wasSkipped: false },
			{ stepName: 'test:step2', stepSectionName: 'test:section2', wasSkipped: false },
			{ stepName: 'test:step3', stepSectionName: 'test:section3', wasSkipped: false },
		],
		translate: ( str ) => `translated:${ str }`,
	};
	const signupUtils = { getStepUrl: noop };
	const tracks = { recordEvent: noop };
	let PreviousStepButton, props;

	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', { tracks } );
		mockery.registerMock( 'signup/utils', signupUtils );
		mockery.registerMock( 'i18n-calypso', { getLocaleSlug: () => 'en', localize: () => {} } );
	} );

	before( () => {
		PreviousStepButton = require( '..' ).PreviousStepButton;
	} );

	beforeEach( () => {
		props = Object.assign( {}, defaultProps );

		signupUtils.getStepUrl = stub();
		signupUtils.getPreviousStepName = stub().returns( 'test:step1' );
		tracks.recordEvent = spy();
	} );

	it( 'should render an anchor element', () => {
		const wrapper = shallow( <PreviousStepButton { ...props } /> );

		const anchor = wrapper.find( 'a' );
		expect( anchor ).to.have.length( 1 );

		// The anchor element should have a span element contains translated text
		expect( anchor.find( 'span' ) ).to.have.length( 1 );
		expect( anchor.find( 'span' ).text() ).to.equal( 'translated:Back' );
	} );

	it( 'should render null if positionInFlow prop == 0.', () => {
		const wrapper = shallow( <PreviousStepButton { ...props } positionInFlow={ 0 } /> );

		expect( wrapper.type() ).to.be.null;
	} );

	it( 'should trigger a track event if the rendered anchor is clicked', () => {
		const wrapper = shallow( <PreviousStepButton { ...props } /> );

		expect( tracks.recordEvent ).not.to.be.called;
		wrapper.simulate( 'click' );
		expect( tracks.recordEvent ).to.be.calledWith( 'calypso_signup_previous_step_button_click' );
	} );

	it( 'should use the value of backUrl prop as href attribute if the prop exists', () => {
		const wrapper = shallow( <PreviousStepButton { ...props } backUrl="test:back-url" /> );

		const anchor = wrapper.find( 'a' );
		expect( anchor.prop( 'href' ) ).to.equal( 'test:back-url' );
	} );
} );
