/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import AgencyPartnerDirectoryLeadMatching from '..';
import { render } from '../../../../test-utils';
import { completeProfile, mockAgency, mockLeadMatching } from './fixtures';

describe( '<AgencyPartnerDirectoryLeadMatching>', () => {
	test( 'shows the tabs and a not set up status without preferences', async () => {
		mockAgency();
		mockLeadMatching( null );

		render( <AgencyPartnerDirectoryLeadMatching /> );

		expect( await screen.findByRole( 'tab', { name: 'Lead matching' } ) ).toHaveAttribute(
			'aria-selected',
			'true'
		);
		expect( screen.getByRole( 'tab', { name: 'Overview' } ) ).toBeVisible();
		expect( await screen.findByText( 'Not set up' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Set up preferences' } ) ).toHaveAttribute(
			'href',
			'/partner-directory/lead-matching/preferences'
		);
		expect( screen.getByText( 'Optional, not answered' ) ).toBeVisible();
		expect( screen.getAllByText( 'Not answered yet' ) ).toHaveLength( 6 );
	} );

	test( 'counts the answers and lists them per section', async () => {
		mockAgency();
		mockLeadMatching( {
			...completeProfile,
			service_and_budget: { ...completeProfile.service_and_budget, max_service_level: '' },
		} );

		render( <AgencyPartnerDirectoryLeadMatching /> );

		expect( await screen.findByText( '10 of 11 answered' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Update preferences' } ) ).toBeVisible();
		expect( screen.getByText( 'EMEA (Europe, Middle East, Africa) · English' ) ).toBeVisible();
		expect( screen.getByText( 'Some questions not answered yet' ) ).toBeVisible();
	} );

	test( 'is not eligible while not accepting clients', async () => {
		mockAgency( false );
		mockLeadMatching( completeProfile );

		render( <AgencyPartnerDirectoryLeadMatching /> );

		expect( await screen.findByText( 'Not eligible' ) ).toBeVisible();
		expect( screen.getByText( 'Not accepting new clients' ) ).toBeVisible();
	} );
} );
