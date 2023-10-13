/**
 * @jest-environment jsdom
 */
import { PLAN_FREE, PLAN_PERSONAL } from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import {
	FREE_PLAN_FREE_DOMAIN_DIALOG,
	FREE_PLAN_PAID_DOMAIN_DIALOG,
	PAID_PLAN_IS_REQUIRED_DIALOG,
} from '..';
import { useModalResolutionCallback } from '../hooks/use-modal-resolution-callback';

describe( 'useModalResolutionCallback tests', () => {
	test( 'A paid domain on the onboarding-pm flow should show the FREE_PLAN_PAID_DOMAIN_DIALOG', () => {
		const {
			result: { current: resolveModal },
		} = renderHook( () =>
			useModalResolutionCallback( { paidDomainName: 'test.com', flowName: 'onboarding-pm' } )
		);
		expect( resolveModal( PLAN_FREE ) ).toEqual( FREE_PLAN_PAID_DOMAIN_DIALOG );
	} );
	test( 'A free domain on the onboarding-pm flow should show the FREE_PLAN_PAID_DOMAIN_DIALOG', () => {
		const {
			result: { current: resolveModal },
		} = renderHook( () =>
			useModalResolutionCallback( { paidDomainName: undefined, flowName: 'onboarding-pm' } )
		);
		expect( resolveModal( PLAN_FREE ) ).toEqual( FREE_PLAN_FREE_DOMAIN_DIALOG );
	} );

	test( 'A free domain on the onboarding flow should show the FREE_PLAN_PAID_DOMAIN_DIALOG', () => {
		const {
			result: { current: resolveModal },
		} = renderHook( () =>
			useModalResolutionCallback( { paidDomainName: undefined, flowName: 'onboarding' } )
		);
		expect( resolveModal( PLAN_FREE ) ).toEqual( FREE_PLAN_FREE_DOMAIN_DIALOG );
	} );

	test( 'A paid domain on the onboarding flow should show the PAID_PLAN_IS_REQUIRED_DIALOG', () => {
		const {
			result: { current: resolveModal },
		} = renderHook( () =>
			useModalResolutionCallback( {
				paidDomainName: 'some-othertest.com',
				flowName: 'onboarding',
			} )
		);
		expect( resolveModal( PLAN_FREE ) ).toEqual( PAID_PLAN_IS_REQUIRED_DIALOG );
	} );

	test( 'Paid plan selections should not show any modals', () => {
		/**
		 * Flow onboarding paid domain
		 */
		const {
			result: { current: resolveModal1 },
		} = renderHook( () =>
			useModalResolutionCallback( {
				paidDomainName: 'some-othertest.com',
				flowName: 'onboarding',
			} )
		);
		expect( resolveModal1( PLAN_PERSONAL ) ).toBeNull();

		/**
		 * Flow onboarding-pm paid domain
		 */
		const {
			result: { current: resolveModal2 },
		} = renderHook( () =>
			useModalResolutionCallback( {
				paidDomainName: 'some-othertest.com',
				flowName: 'onboarding-pm',
			} )
		);
		expect( resolveModal2( PLAN_PERSONAL ) ).toBeNull();

		/**
		 * Flow onboarding free domain
		 */
		const {
			result: { current: resolveModal3 },
		} = renderHook( () =>
			useModalResolutionCallback( {
				paidDomainName: undefined,
				flowName: 'onboarding',
			} )
		);
		expect( resolveModal3( PLAN_PERSONAL ) ).toBeNull();

		/**
		 * Flow onboarding-pm free domain
		 */
		const {
			result: { current: resolveModal4 },
		} = renderHook( () =>
			useModalResolutionCallback( {
				paidDomainName: undefined,
				flowName: 'onboarding-pm',
			} )
		);
		expect( resolveModal4( PLAN_PERSONAL ) ).toBeNull();
	} );
} );
