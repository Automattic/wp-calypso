/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/analytics/track-component-view', () => 'TrackComponentView' );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'components/banner', () => 'Banner' );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	numberFormat: x => x,
} ) );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { EligibilityWarnings } from '../';

const props = {
	translate: x => x,
};

describe( 'EligibilityWarnings basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <EligibilityWarnings { ...props } /> );
		expect( comp.find( '.eligibility-warnings' ).length ).toBe( 1 );
	} );

	test( 'should track views', () => {
		const comp = shallow( <EligibilityWarnings { ...props } /> );
		expect( comp.find( 'TrackComponentView' ).length ).toBe( 1 );
	} );

	test( 'should render theme upsell banner when right conditions are met', () => {
		const comp = shallow(
			<EligibilityWarnings
				{ ...props }
				context="plugins"
				hasBusinessPlan={ false }
				isJetpack={ false }
			/>
		);
		expect( comp.find( 'Banner[event="calypso-plugin-eligibility-upgrade-nudge"]' ).length ).toBe(
			1
		);
	} );

	test( 'should not render theme upsell banner when right conditions are not met', () => {
		let comp;

		comp = shallow(
			<EligibilityWarnings
				{ ...props }
				context="plugins"
				hasBusinessPlan={ true }
				isJetpack={ false }
			/>
		);
		expect( comp.find( 'Banner[event="calypso-plugin-eligibility-upgrade-nudge"]' ).length ).toBe(
			0
		);

		comp = shallow(
			<EligibilityWarnings
				{ ...props }
				context="plugins"
				hasBusinessPlan={ false }
				isJetpack={ true }
			/>
		);
		expect( comp.find( 'Banner[event="calypso-plugin-eligibility-upgrade-nudge"]' ).length ).toBe(
			0
		);
	} );

	test( 'should render custom domain banner when right conditions are met', () => {
		const comp = shallow(
			<EligibilityWarnings
				{ ...props }
				context="plugins"
				hasBusinessPlan={ true }
				isJetpack={ false }
				eligibilityData={ { eligibilityHolds: [ 'NOT_USING_CUSTOM_DOMAIN' ] } }
			/>
		);
		expect( comp.find( 'Banner[icon="domains"]' ).length ).toBe( 1 );
	} );

	test( 'should not render custom domain banner when right conditions are not met', () => {
		let comp;

		comp = shallow(
			<EligibilityWarnings
				{ ...props }
				context="plugins"
				hasBusinessPlan={ true }
				isJetpack={ false }
			/>
		);
		expect( comp.find( 'Banner[icon="domains"]' ).length ).toBe( 0 );

		comp = shallow(
			<EligibilityWarnings
				{ ...props }
				context="plugins"
				hasBusinessPlan={ false }
				isJetpack={ false }
				eligibilityData={ { eligibilityHolds: [ 'NOT_USING_CUSTOM_DOMAIN' ] } }
			/>
		);
		expect( comp.find( 'Banner[icon="domains"]' ).length ).toBe( 0 );

		comp = shallow(
			<EligibilityWarnings
				{ ...props }
				context="plugins"
				hasBusinessPlan={ true }
				isJetpack={ true }
				eligibilityData={ { eligibilityHolds: [ 'NOT_USING_CUSTOM_DOMAIN' ] } }
			/>
		);
		expect( comp.find( 'Banner[icon="domains"]' ).length ).toBe( 0 );
	} );
} );

describe( 'EligibilityWarnings.render()', () => {
	const myProps = {
		...props,
		hasBusinessPlan: false,
		isJetpack: false,
		context: 'plugins',
	};
	[ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( product_slug => {
		test( `Business 1 year for (${ product_slug })`, () => {
			const comp = shallow(
				<EligibilityWarnings { ...myProps } site={ { plan: { product_slug } } } />
			);
			expect(
				comp.find( 'Banner[event="calypso-plugin-eligibility-upgrade-nudge"]' ).props().plan
			).toBe( PLAN_BUSINESS );
		} );
	} );

	[ PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( product_slug => {
		test( `Business 2 year for (${ product_slug })`, () => {
			const comp = shallow(
				<EligibilityWarnings { ...myProps } site={ { plan: { product_slug } } } />
			);
			expect(
				comp.find( 'Banner[event="calypso-plugin-eligibility-upgrade-nudge"]' ).props().plan
			).toBe( PLAN_BUSINESS_2_YEARS );
		} );
	} );
} );
