/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { EligibilityErrors, ErrorContentInfo } from '../error-content-info';
import type { AutomatedTransferEligibilityError } from '@automattic/api-core';

const errors = [
	{ code: EligibilityErrors.NO_BUSINESS_PLAN },
] as AutomatedTransferEligibilityError[];

describe( '<ErrorContentInfo>', () => {
	afterEach( () => {
		config.disable( 'hosting/dev-tools-all-paid-plans' );
	} );

	test( 'asks for the Business plan with hosting/dev-tools-all-paid-plans disabled', async () => {
		render( <ErrorContentInfo errors={ errors } /> );

		expect( await screen.findByText( 'Business plan required' ) ).toBeVisible();
	} );

	test( 'asks for the Personal plan with hosting/dev-tools-all-paid-plans enabled', async () => {
		config.enable( 'hosting/dev-tools-all-paid-plans' );

		render( <ErrorContentInfo errors={ errors } /> );

		expect( await screen.findByText( 'Personal plan required' ) ).toBeVisible();
	} );
} );
