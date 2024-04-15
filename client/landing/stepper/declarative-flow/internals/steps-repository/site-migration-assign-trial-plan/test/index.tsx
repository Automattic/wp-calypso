/**
 * @jest-environment jsdom
 */
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import SiteMigrationAssignTrialPlanStep from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationAssignTrialPlanStep { ...combinedProps } />, renderOptions );
};

const planSlug = PLAN_MIGRATION_TRIAL_MONTHLY;

describe( 'SiteMigrationAssignTrialPlanStep', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'shows the error step when the api returns an error', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.post( `/wpcom/v2/sites/123456789/hosting/trial/add/${ planSlug }` )
			.reply( 500, new Error( 'Internal Server Error' ) );

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { error: true } ) )
		);
	} );
} );
