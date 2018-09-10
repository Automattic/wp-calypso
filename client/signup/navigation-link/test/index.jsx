/** @format */
/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { NavigationLink } from '../';
import EMPTY_COMPONENT from 'components/empty-component';
import GridiconArrowRight from 'gridicons/dist/arrow-right';
import GridiconArrowLeft from 'gridicons/dist/arrow-left';

jest.mock( 'lib/analytics', () => ( {
	tracks: {
		recordEvent: () => {},
	},
} ) );
jest.mock( 'lib/signup/actions', () => ( {
	submitSignupStep: jest.fn(),
} ) );
jest.mock( 'signup/utils', () => ( {
	getStepUrl: jest.fn(),
} ) );

const signupUtils = require( 'signup/utils' );
const { getStepUrl } = signupUtils;

describe( 'NavigationLink', () => {
	const Gridicon = EMPTY_COMPONENT;
	const defaultProps = {
		flowName: 'test:flow',
		stepName: 'test:step2',
		positionInFlow: 1,
		stepSectionName: 'test:section',
		signupProgress: [
			{ stepName: 'test:step1', stepSectionName: 'test:section1', wasSkipped: false },
			{ stepName: 'test:step2', stepSectionName: 'test:section2', wasSkipped: false },
			{ stepName: 'test:step3', stepSectionName: 'test:section3', wasSkipped: false },
		],
		goToNextStep: jest.fn(),
		translate: str => `translated:${ str }`,
	};
	let props;

	beforeEach( () => {
		props = Object.assign( {}, defaultProps );
		props.goToNextStep = jest.fn();
	} );

	afterEach( () => {
		getStepUrl.mockReset();
	} );

	test( 'should render Button element', () => {
		const wrapper = shallow( <NavigationLink { ...props } /> );

		expect( wrapper.find( 'Button' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'Button' ).props().className ).toEqual( 'navigation-link' );
	} );

	test( 'should render no icons when the direction prop is undefined', () => {
		const wrapper = shallow( <NavigationLink { ...props } /> );
		expect( wrapper.find( Gridicon ).exists() ).toEqual( false );
	} );

	test( 'should render right-arrow icon when the direction prop is "forward".', () => {
		const wrapper = shallow( <NavigationLink { ...props } direction="forward" /> );

		expect( wrapper.find( GridiconArrowRight ) ).toHaveLength( 1 );
		expect( wrapper.childAt( 0 ).text() ).toEqual( 'translated:Skip for now' );
	} );

	test( 'should render left-arrow icon when the direction prop is "back".', () => {
		const wrapper = shallow( <NavigationLink { ...props } direction="back" /> );

		expect( wrapper.find( GridiconArrowLeft ) ).toHaveLength( 1 );
		expect( wrapper.childAt( 1 ).text() ).toEqual( 'translated:Back' );
	} );

	test( 'should set href prop to undefined when the direction is not "back".', () => {
		const wrapper = shallow( <NavigationLink { ...props } direction="forward" /> );
		expect( wrapper.props().href ).toBeUndefined();
	} );

	test( 'should set a proper url as href prop when the direction is "back".', () => {
		expect( getStepUrl ).not.toHaveBeenCalled();

		const wrapper = shallow( <NavigationLink { ...props } direction="back" /> );

		// It should call getStepUrl()
		expect( getStepUrl ).toHaveBeenCalled();
		expect( getStepUrl ).toHaveBeenCalledWith( 'test:flow', 'test:step1', 'test:section1', 'en' );

		// when it is the first step
		getStepUrl.mockReset();
		wrapper.setProps( { stepName: 'test:step1' } ); // set the first step
		expect( getStepUrl ).toHaveBeenCalled();
		expect( getStepUrl ).toHaveBeenCalledWith( 'test:flow', null, '', 'en' );

		// The href should be backUrl when exist.
		wrapper.setProps( { backUrl: 'test:back-url' } );
		expect( wrapper.props().href ).toEqual( 'test:back-url' );
	} );

	test( 'should call goToNextStep() only when the direction is forward and clicked', () => {
		const wrapper = shallow( <NavigationLink { ...props } direction="forward" /> );

		expect( props.goToNextStep ).not.toHaveBeenCalled();
		wrapper.simulate( 'click' );
		expect( props.goToNextStep ).toHaveBeenCalled();
	} );

	test( 'should not call goToNextStep() when the direction is back', () => {
		const wrapper = shallow( <NavigationLink { ...props } direction="back" /> );

		expect( props.goToNextStep ).not.toHaveBeenCalled();
		wrapper.simulate( 'click' );
		expect( props.goToNextStep ).not.toHaveBeenCalled();
	} );
} );
