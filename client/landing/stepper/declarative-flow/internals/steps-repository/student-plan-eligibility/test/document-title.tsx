/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import StudentPlanEligibility from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

const FLOW_TITLE = 'Create a site';

// Stepper renders the flow's `DocumentHead` above the current step, and the step itself loads
// lazily, so it mounts after the flow title is set.
const FlowWithEligibilityStep = () => {
	const [ isOnStep, setIsOnStep ] = useState( false );

	useEffect( () => setIsOnStep( true ), [] );

	return (
		<QueryClientProvider client={ new QueryClient() }>
			<DocumentHead title={ FLOW_TITLE } />
			{ isOnStep ? (
				<StudentPlanEligibility
					{ ...mockStepProps( { stepName: 'student-plan-eligibility', flow: 'student' } ) }
				/>
			) : (
				<p>Next step</p>
			) }
			<button onClick={ () => setIsOnStep( false ) }>Leave the step</button>
		</QueryClientProvider>
	);
};

describe( 'StudentPlanEligibility document title', () => {
	beforeAll( () => nock.disableNetConnect() );

	afterEach( () => nock.cleanAll() );

	afterAll( () => nock.enableNetConnect() );

	it( 'puts the flow title back when the step unmounts', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( '/wpcom/v2/me/student-plan-eligibility' )
			.query( true )
			.reply( 200, { eligible: false, reason: 'not_academic', email_domain: '' } );

		renderStep( <FlowWithEligibilityStep />, {
			initialEntry: '/setup/student/student-plan-eligibility',
			initialState: { currentUser: { user: { email: 'student@gmail.com' } } },
		} );

		await waitFor( () =>
			expect( document.title ).toMatch( /^The Student plan needs a school email/ )
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Leave the step' } ) );

		await waitFor( () => expect( document.title ).toMatch( new RegExp( `^${ FLOW_TITLE } — ` ) ) );
	} );
} );
