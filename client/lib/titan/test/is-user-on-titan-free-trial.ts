// @ts-nocheck - TODO: Fix TypeScript issues
import { isUserOnTitanFreeTrial } from '..';
import {
	exampleTrialEmailCost,
	examplePaidEmailCost,
	exampleTrialResponseDomain,
	examplePaidResponseDomain,
} from './lib/fixtures';

describe( 'isUserOnTitanFreeTrial()', () => {
	test( 'return true when EmailCost has trial data', () => {
		expect( isUserOnTitanFreeTrial( exampleTrialEmailCost ) ).toBe( true );
	} );

	test( 'return false when EmailCost has paid data', () => {
		expect( isUserOnTitanFreeTrial( examplePaidEmailCost ) ).toBe( false );
	} );

	test( 'return true when ResponseDomain has trial data', () => {
		expect( isUserOnTitanFreeTrial( exampleTrialResponseDomain ) ).toBe( true );
	} );

	test( 'return false when ResponseDomain has paid data', () => {
		expect( isUserOnTitanFreeTrial( examplePaidResponseDomain ) ).toBe( false );
	} );
} );
