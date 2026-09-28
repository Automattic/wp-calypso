/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import newHostedSiteFlow from '../new-hosted-site-flow';

let mockSearch = '';

jest.mock( '@automattic/onboarding', () => ( {
	NEW_HOSTED_SITE_FLOW: 'new-hosted-site-flow',
	clearStepPersistedState: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '../../../../stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
} ) );

jest.mock( '../../../../hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams( mockSearch ),
} ) );

const renderSideEffect = ( currentStepSlug: string ) =>
	renderHook(
		( { stepSlug } ) =>
			newHostedSiteFlow.useSideEffect?.(
				stepSlug as Parameters< NonNullable< typeof newHostedSiteFlow.useSideEffect > >[ 0 ],
				jest.fn()
			),
		{ initialProps: { stepSlug: currentStepSlug } }
	);

describe( 'new-hosted-site flow side effects', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSearch = 'studioSiteId=123&autoOpenPush=true&section=studio-sync';
	} );

	it( 'records a Studio sync event only after the step resolves', () => {
		const { rerender } = renderSideEffect( '' );

		expect( recordTracksEvent ).not.toHaveBeenCalled();

		rerender( { stepSlug: 'domains' } );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_studio_sync_step', {
			flow: 'new-hosted-site-flow',
			step: 'domains',
			section: 'studio-sync',
			auto_open_push: true,
		} );
	} );
} );
