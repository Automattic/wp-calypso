jest.mock( 'components/happiness-support', () => 'HappinessSupport' );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
/**
 * Internal dependencies
 */
import { HappinessSupportCard } from '../happiness-support-card';

describe( '<HappinessSupport isJetpackFreePlan', () => {
	const props = {
		isJetpackFreePlan: true,
	};
	test( 'Should be true if Jetpack free plan', () => {
		const comp = shallow(
			<HappinessSupportCard { ...props } />
		);
		expect( comp.find( 'HappinessSupport' ).props().isJetpackFreePlan ).toBe( true );
	} );
} );

describe( '<HappinessSupport isEligibleForLiveChat', () => {
	const props = {
		showLiveChatButton: true,
	};
	test( 'Should be eligible for live chat', () => {
		const comp = shallow(
			<HappinessSupportCard { ...props } />
		);
		expect( comp.find( 'HappinessSupport' ).props().showLiveChatButton ).toBe( true );
	} );
} );
