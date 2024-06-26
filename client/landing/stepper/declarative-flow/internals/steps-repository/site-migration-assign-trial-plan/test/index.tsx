/**
 * @jest-environment jsdom
 */
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationAssignTrialPlanStep from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/hooks/use-site' );

const siteId = 123456789;
const planSlug = PLAN_MIGRATION_TRIAL_MONTHLY;

( useSite as jest.Mock ).mockReturnValue( {
	ID: siteId,
	URL: 'https://site-url.wordpress.com',
} );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationAssignTrialPlanStep { ...combinedProps } />, renderOptions );
};

describe( 'SiteMigrationAssignTrialPlanStep', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'submits the step when the api returns a response', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.post( `/wpcom/v2/sites/${ siteId }/hosting/trial/add/${ planSlug }`, {
				hosting_intent: 'migrate',
			} )
			.reply( 200 );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
	} );

	it( 'submits the step with an error object when the api returns an error', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.post( `/wpcom/v2/sites/${ siteId }/hosting/trial/add/${ planSlug }`, {
				hosting_intent: 'migrate',
			} )
			.reply( 500, new Error( 'Internal Server Error' ) );

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { error: true } ) )
		);
	} );
} );
