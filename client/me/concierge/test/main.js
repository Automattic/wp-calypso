jest.mock( 'calypso/lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( '../shared/upsell', () => 'Upsell' );
jest.mock( '../shared/no-available-times', () => 'NoAvailableTimes' );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { ConciergeMain } from '../main';

const props = {
	steps: [ 'Step1' ],
	availableTimes: [
		1541506500000,
		1541508300000,
		1541510100000,
		1541511900000,
		1541513700000,
		1541515500000,
		1541516400000,
	],
	site: {
		plan: {},
	},
	userSettings: {},
	skeleton: 'Skeleton',
};

describe( 'ConciergeMain basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <ConciergeMain { ...props } /> );
		expect( comp.find( 'Main' ) ).toHaveLength( 1 );
	} );

	test( 'should short-circuit to <Skeleton /> when data is insufficient to render anything else', () => {
		let comp;

		comp = shallow( <ConciergeMain { ...props } availableTimes={ null } /> );
		expect( comp.find( 'Skeleton' ) ).toHaveLength( 1 );

		comp = shallow( <ConciergeMain { ...props } site={ null } /> );
		expect( comp.find( 'Skeleton' ) ).toHaveLength( 1 );

		comp = shallow( <ConciergeMain { ...props } site={ { plan: null } } /> );
		expect( comp.find( 'Skeleton' ) ).toHaveLength( 1 );

		comp = shallow( <ConciergeMain { ...props } userSettings={ null } /> );
		expect( comp.find( 'Skeleton' ) ).toHaveLength( 1 );
	} );
} );

describe( 'ConciergeMain.render()', () => {
	test( 'Should render upsell for non-eligible users', () => {
		const comp = shallow( <ConciergeMain { ...props } scheduleId={ 0 } /> );
		expect( comp.find( 'Upsell' ) ).toHaveLength( 1 );
		expect( comp.find( 'Step1' ) ).toHaveLength( 0 );
	} );

	test( 'Should render NoAvailableTimes if no times are available.', () => {
		const propsWithoutAvailableTimes = { ...props, availableTimes: [] };
		const comp = shallow(
			<ConciergeMain
				{ ...propsWithoutAvailableTimes }
				scheduleId={ 1 }
				site={ { plan: { product_slug: 'a-plan' } } }
			/>
		);
		expect( comp.find( 'NoAvailableTimes' ) ).toHaveLength( 1 );
	} );

	test( 'Should render CurrentStep for eligible users', () => {
		const comp = shallow(
			<ConciergeMain { ...props } scheduleId={ 1 } site={ { plan: { product_slug: 'a-plan' } } } />
		);
		expect( comp.find( 'Upsell' ) ).toHaveLength( 0 );
		expect( comp.find( 'Step1' ) ).toHaveLength( 1 );
	} );
} );
