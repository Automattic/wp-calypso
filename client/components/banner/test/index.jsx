jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'blocks/dismissible-card', () => {
	const React = require( 'react' );
	return class DismissibleCard extends React.Component {};
} );

jest.mock( 'lib/analytics/track-component-view', () => {
	const React = require( 'react' );
	return class TrackComponentView extends React.Component {};
} );

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Comp ) => ( props ) => (
		<Comp
			{ ...props }
			translate={ function ( x ) {
				return x;
			} }
		/>
	),
	numberFormat: ( x ) => x,
	translate: ( x ) => x,
} ) );

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { Banner } from '../index';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';
import PlanPrice from 'my-sites/plan-price/';

const props = {
	callToAction: null,
	plan: PLAN_FREE,
	title: 'banner title',
};

describe( 'Banner basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <Banner { ...props } /> );
		expect( comp.find( '.banner' ) ).toHaveLength( 1 );
	} );

	test( 'should render Card if dismissPreferenceName is null', () => {
		const comp = shallow( <Banner { ...props } dismissPreferenceName={ null } /> );
		expect( comp.find( 'Card' ) ).toHaveLength( 1 );
		expect( comp.find( 'DismissibleCard' ) ).toHaveLength( 0 );
	} );

	test( 'should render DismissibleCard if dismissPreferenceName is defined', () => {
		const comp = shallow( <Banner { ...props } dismissPreferenceName={ 'banner-test' } /> );
		expect( comp.find( 'Card' ) ).toHaveLength( 0 );
		expect( comp.find( 'DismissibleCard' ) ).toHaveLength( 1 );
	} );

	test( 'should have .has-call-to-action class if callToAction is defined', () => {
		const comp = shallow( <Banner { ...props } callToAction={ 'Upgrade Now!' } /> );
		expect( comp.find( '.has-call-to-action' ) ).toHaveLength( 1 );
	} );

	test( 'should not have .has-call-to-action class if callToAction is null', () => {
		const comp = shallow( <Banner { ...props } callToAction={ null } /> );
		expect( comp.find( '.has-call-to-action' ) ).toHaveLength( 0 );
	} );

	test( 'should render a <Button /> when callToAction is specified', () => {
		const comp = shallow( <Banner { ...props } callToAction={ 'Buy something!' } /> );
		expect( comp.find( 'Button' ) ).toHaveLength( 1 );
	} );

	test( 'should not render a <Button /> when callToAction is not specified', () => {
		const comp = shallow( <Banner { ...props } /> );
		expect( comp.find( 'Button' ) ).toHaveLength( 0 );
	} );

	test( 'should have .is-jetpack class and JetpackLogo if jetpack prop is defined', () => {
		const { plan, ...propsWithoutPlan } = props;
		const comp = shallow( <Banner { ...propsWithoutPlan } jetpack /> );
		expect( comp.find( '.is-jetpack' ) ).toHaveLength( 1 );
		expect( comp.find( 'JetpackLogo' ) ).toHaveLength( 1 );
	} );

	test( 'should render have .is-horizontal class if horizontal prop is defined', () => {
		const comp = shallow( <Banner { ...props } horizontal /> );
		expect( comp.find( '.is-horizontal' ) ).toHaveLength( 1 );
	} );

	test( 'should render a <PlanPrice /> when price is specified', () => {
		const comp = shallow( <Banner { ...props } price={ 100 } /> );
		expect( comp.find( PlanPrice ) ).toHaveLength( 1 );
	} );

	test( 'should render two <PlanPrice /> components when there are two prices', () => {
		const comp = shallow( <Banner { ...props } price={ [ 100, 80 ] } /> );
		expect( comp.find( PlanPrice ) ).toHaveLength( 2 );
	} );

	test( 'should render no <PlanPrice /> components when there are no prices', () => {
		const comp = shallow( <Banner { ...props } /> );
		expect( comp.find( PlanPrice ) ).toHaveLength( 0 );
	} );

	test( 'should render a .banner__description when description is specified', () => {
		const comp = shallow( <Banner { ...props } description="test" /> );
		expect( comp.find( '.banner__description' ) ).toHaveLength( 1 );
	} );

	test( 'should not render a .banner__description when description is not specified', () => {
		const comp = shallow( <Banner { ...props } /> );
		expect( comp.find( '.banner__description' ) ).toHaveLength( 0 );
	} );

	test( 'should render a .banner__list when list is specified', () => {
		const comp = shallow( <Banner { ...props } list={ [ 'test1', 'test2' ] } /> );
		expect( comp.find( '.banner__list' ) ).toHaveLength( 1 );
		expect( comp.find( '.banner__list li' ) ).toHaveLength( 2 );
		expect( comp.find( '.banner__list li' ).at( 0 ).text() ).toContain( 'test1' );
		expect( comp.find( '.banner__list li' ).at( 1 ).text() ).toContain( 'test2' );
	} );

	test( 'should not render a .banner__list when description is not specified', () => {
		const comp = shallow( <Banner { ...props } /> );
		expect( comp.find( '.banner__list' ) ).toHaveLength( 0 );
	} );

	test( 'should record Tracks event when event is specified', () => {
		const comp = shallow( <Banner { ...props } event="test" /> );
		expect( comp.find( 'TrackComponentView' ) ).toHaveLength( 1 );
	} );

	test( 'should not record Tracks event when event is not specified', () => {
		const comp = shallow( <Banner { ...props } /> );
		expect( comp.find( 'TrackComponentView' ) ).toHaveLength( 0 );
	} );

	test( 'should render Card with href if href prop is passed', () => {
		const comp = shallow( <Banner { ...props } href={ '/' } /> );
		expect( comp.find( 'Card' ) ).toHaveLength( 1 );
		expect( comp.find( 'Card' ).props().href ).toBe( '/' );
	} );

	test( 'should render Card with no href if href prop is passed but disableHref is true', () => {
		const comp = shallow( <Banner { ...props } href={ '/' } disableHref={ true } /> );
		expect( comp.find( 'Card' ) ).toHaveLength( 1 );
		expect( comp.find( 'Card' ).props().href ).toBeNull();
	} );

	test( 'should render Card with href if href prop is passed but disableHref is true and forceHref is true', () => {
		const comp = shallow(
			<Banner { ...props } href={ '/' } disableHref={ true } forceHref={ true } />
		);
		expect( comp.find( 'Card' ) ).toHaveLength( 1 );
		expect( comp.find( 'Card' ).props().href ).toBe( '/' );
	} );

	test( 'should render Card with no href and CTA button with href if href prop is passed and callToAction is also passed', () => {
		const comp = shallow( <Banner { ...props } href={ '/' } callToAction="Go WordPress!" /> );
		expect( comp.find( 'Card' ) ).toHaveLength( 1 );
		expect( comp.find( 'Card' ).props().href ).toBeNull();
		expect( comp.find( 'Card' ).props().onClick ).toBeNull();

		expect( comp.find( 'Button' ) ).toHaveLength( 1 );
		expect( comp.find( 'Button' ).props().href ).toBe( '/' );
		expect( comp.find( 'Button' ).props().children ).toBe( 'Go WordPress!' );
		expect( comp.find( 'Button' ).props().onClick ).toBe( comp.instance().handleClick );
	} );

	test( 'should render Card with href and CTA button with no href if href prop is passed and callToAction is also passed and forceHref is true', () => {
		const comp = shallow(
			<Banner { ...props } href={ '/' } callToAction="Go WordPress!" forceHref={ true } />
		);
		expect( comp.find( 'Card' ) ).toHaveLength( 1 );
		expect( comp.find( 'Card' ).props().href ).toBe( '/' );
		expect( comp.find( 'Card' ).props().onClick ).toBe( comp.instance().handleClick );

		expect( comp.find( 'Button' ) ).toHaveLength( 1 );
		expect( comp.find( 'Button' ).props().href ).toBeUndefined();
		expect( comp.find( 'Button' ).props().children ).toBe( 'Go WordPress!' );
	} );
} );

describe( 'Banner should have a class name corresponding to appropriate plan', () => {
	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Personal', () => {
			const comp = shallow( <Banner { ...props } plan={ plan } /> );
			expect( comp.find( '.is-upgrade-personal' ) ).toHaveLength( 1 );
		} );
	} );

	[
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Premium', () => {
			const comp = shallow( <Banner { ...props } plan={ plan } /> );
			expect( comp.find( '.is-upgrade-premium' ) ).toHaveLength( 1 );
		} );
	} );

	[
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Business', () => {
			const comp = shallow( <Banner { ...props } plan={ plan } /> );
			expect( comp.find( '.is-upgrade-business' ) ).toHaveLength( 1 );
		} );
	} );
} );
