/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { PARTNER_DIRECTORY_LEAD_MATCHING_PREFERENCES_ROUTE } from '../../partner-directory/paths';
import MatchingProfilePreview from '../matching-profile-preview';

afterEach( () => {
	window.history.replaceState( {}, '', '/' );
} );

test( 'records one CTA click and preserves flags on the native matching destination', async () => {
	window.history.replaceState(
		{},
		'',
		'/overview?flags=+oauth,-other-preview,a4a-lead-matching-design-preview&unrelated=value'
	);
	const recordTracksEvent = jest.fn();

	render(
		<MatchingProfilePreview
			href={ PARTNER_DIRECTORY_LEAD_MATCHING_PREFERENCES_ROUTE }
			answered={ 0 }
			agencyId={ 123 }
			isDesignPreview
			recordTracksEvent={ recordTracksEvent }
		/>
	);

	const link = await screen.findByRole< HTMLAnchorElement >( 'link', {
		name: 'Set up preferences',
	} );
	const destination = new URL( link.href );
	expect( destination.origin ).toBe( window.location.origin );
	expect( destination.pathname ).toBe( PARTNER_DIRECTORY_LEAD_MATCHING_PREFERENCES_ROUTE );
	expect( destination.searchParams.get( 'flags' )?.split( ',' ) ).toEqual( [
		'+oauth',
		'-other-preview',
		'a4a-lead-matching-design-preview',
	] );
	expect( destination.searchParams.has( 'unrelated' ) ).toBe( false );

	expect( recordTracksEvent ).not.toHaveBeenCalled();

	link.addEventListener( 'click', ( event ) => event.preventDefault(), { once: true } );
	await userEvent.click( link );

	expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_lead_matching_click', {
		agency_id: 123,
		is_design_preview: true,
	} );
} );

test.each( [
	[ '', null ],
	[ '?flags=+oauth', '+oauth' ],
] )(
	'keeps the normal completion flow out of design preview with search %s',
	async ( search, expectedFlags ) => {
		window.history.replaceState( {}, '', `/overview${ search }` );
		const recordTracksEvent = jest.fn();
		render(
			<MatchingProfilePreview
				href={ PARTNER_DIRECTORY_LEAD_MATCHING_PREFERENCES_ROUTE }
				answered={ 10 }
				agencyId={ 123 }
				recordTracksEvent={ recordTracksEvent }
			/>
		);
		const link = await screen.findByRole< HTMLAnchorElement >( 'link', {
			name: 'Finish preferences',
		} );
		expect( new URL( link.href ).searchParams.get( 'flags' ) ).toBe( expectedFlags );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
		link.addEventListener( 'click', ( event ) => event.preventDefault(), { once: true } );
		await userEvent.click( link );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_lead_matching_click', {
			agency_id: 123,
			is_design_preview: false,
		} );
	}
);
