/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PlanFeaturesHeader } from '../header';
import {
	PLAN_PREMIUM
} from 'lib/plans/constants';

describe( 'plan-features-header', () => {
	it( 'should have component class', () => {
		const header = shallow(
			<PlanFeaturesHeader
				billingTimeFrame={ 'per month' }
				current={ false }
				planType={ PLAN_PREMIUM }
				popular={ true }
				rawPrice={ 8.25 }
				currencyCode={ 'USD' }
				title={ 'Premium' }
			/>
		);
		expect( header.hasClass( 'plan-features__header' ) ).to.equal( true );
	} );
} );
