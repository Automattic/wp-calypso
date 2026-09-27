/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import TwoStepRequiredNotice, { useSitesRequiringTwoStep } from '../index';
import type { Site, User } from '@automattic/api-core';

function makeSite( {
	ID = 1,
	name = 'Team Site',
	requiresTwoStep = true,
	jetpackModules = [ 'sso' ],
}: {
	ID?: number;
	name?: string;
	requiresTwoStep?: boolean;
	jetpackModules?: string[] | null;
} = {} ) {
	return {
		ID,
		name,
		jetpack: true,
		jetpack_modules: jetpackModules,
		options: { jetpack_sso_require_two_step: requiresTwoStep },
	} as unknown as Site;
}

function accountUser( { twoStepEnabled }: { twoStepEnabled?: boolean } = {} ) {
	return { ID: 1, two_step_enabled: twoStepEnabled } as User;
}

// The hook is exercised through a probe component so it runs inside the same providers
// the notice has on the sites pages.
function HookProbe( { sites }: { sites: Site[] } ) {
	const requiring = useSitesRequiringTwoStep( sites );
	return <div>{ requiring.map( ( site ) => site.ID ).join( ',' ) || 'none' }</div>;
}

describe( 'useSitesRequiringTwoStep', () => {
	test( 'keeps sites that require two-step and have SSO active when the user has no two-step', async () => {
		render(
			<HookProbe
				sites={ [
					makeSite( { ID: 1 } ),
					makeSite( { ID: 2, requiresTwoStep: false } ),
					makeSite( { ID: 3, jetpackModules: [ 'stats' ] } ),
					makeSite( { ID: 4, jetpackModules: null } ),
					makeSite( { ID: 5 } ),
				] }
			/>,
			{ user: accountUser( { twoStepEnabled: false } ) }
		);

		expect( await screen.findByText( '1,5' ) ).toBeVisible();
	} );

	test( 'is empty when the user already has two-step', async () => {
		render( <HookProbe sites={ [ makeSite() ] } />, {
			user: accountUser( { twoStepEnabled: true } ),
		} );

		expect( await screen.findByText( 'none' ) ).toBeVisible();
	} );

	test( 'is empty when the field is absent, as it is before wpcom deploys', async () => {
		render( <HookProbe sites={ [ makeSite() ] } />, { user: accountUser() } );

		expect( await screen.findByText( 'none' ) ).toBeVisible();
	} );
} );

describe( '<TwoStepRequiredNotice>', () => {
	test( 'names the site when one site requires two-step and records an impression', async () => {
		const { recordTracksEvent } = render(
			<TwoStepRequiredNotice sites={ [ makeSite( { name: 'Team Site' } ) ] } />
		);

		expect(
			await screen.findByText( 'Set up two-step authentication to access WP Admin' )
		).toBeVisible();
		expect( screen.getByText( /Team Site requires two-step authentication/ ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_two_step_required_notice_impression',
			undefined
		);
	} );

	test( 'uses the generic copy when several sites require two-step', async () => {
		render(
			<TwoStepRequiredNotice
				sites={ [ makeSite( { ID: 1, name: 'One' } ), makeSite( { ID: 2, name: 'Two' } ) ] }
			/>
		);

		expect(
			await screen.findByText( /Some of your sites require two-step authentication/ )
		).toBeVisible();
	} );

	test( 'links to the two-step settings as its only action', async () => {
		render( <TwoStepRequiredNotice sites={ [ makeSite() ] } /> );

		const links = await screen.findAllByRole( 'link' );
		expect( links ).toHaveLength( 1 );
		expect( links[ 0 ] ).toHaveAccessibleName( 'Set up two-step authentication' );
		expect( links[ 0 ] ).toHaveAttribute( 'href', '/me/security/two-step-auth' );
	} );
} );
