/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import TwoStepRequiredNotice, { useSiteRequiresTwoStep } from '../index';
import type { Site, User } from '@automattic/api-core';

function makeSite( {
	name = 'Team Site',
	requiresTwoStep = true,
	jetpackModules = [ 'sso' ],
}: {
	name?: string;
	requiresTwoStep?: boolean;
	jetpackModules?: string[] | null;
} = {} ) {
	return {
		ID: 1,
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
// the notice has on the site overview.
function HookProbe( { site }: { site: Site } ) {
	return <div>{ useSiteRequiresTwoStep( site ) ? 'required' : 'not required' }</div>;
}

describe( 'useSiteRequiresTwoStep', () => {
	test( 'is true when the site requires two-step, SSO is active and the user has no two-step', async () => {
		render( <HookProbe site={ makeSite() } />, {
			user: accountUser( { twoStepEnabled: false } ),
		} );

		expect( await screen.findByText( 'required' ) ).toBeVisible();
	} );

	test( 'is false when the site does not require two-step', async () => {
		render( <HookProbe site={ makeSite( { requiresTwoStep: false } ) } />, {
			user: accountUser( { twoStepEnabled: false } ),
		} );

		expect( await screen.findByText( 'not required' ) ).toBeVisible();
	} );

	test.each( [
		[ 'inactive', [ 'stats' ] ],
		[ 'unknown', null ],
	] )( 'is false when the SSO module is %s', async ( _label, jetpackModules ) => {
		render( <HookProbe site={ makeSite( { jetpackModules } ) } />, {
			user: accountUser( { twoStepEnabled: false } ),
		} );

		expect( await screen.findByText( 'not required' ) ).toBeVisible();
	} );

	test( 'is false when the user already has two-step', async () => {
		render( <HookProbe site={ makeSite() } />, {
			user: accountUser( { twoStepEnabled: true } ),
		} );

		expect( await screen.findByText( 'not required' ) ).toBeVisible();
	} );

	test( 'is false when the field is absent, as it is before wpcom deploys', async () => {
		render( <HookProbe site={ makeSite() } />, { user: accountUser() } );

		expect( await screen.findByText( 'not required' ) ).toBeVisible();
	} );
} );

describe( '<TwoStepRequiredNotice>', () => {
	test( 'names the site and records an impression', async () => {
		const { recordTracksEvent } = render(
			<TwoStepRequiredNotice site={ makeSite( { name: 'Team Site' } ) } />
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

	test( 'links to the two-step settings as its only action', async () => {
		render( <TwoStepRequiredNotice site={ makeSite() } /> );

		const links = await screen.findAllByRole( 'link' );
		expect( links ).toHaveLength( 1 );
		expect( links[ 0 ] ).toHaveAccessibleName( 'Set up two-step authentication' );
		expect( links[ 0 ] ).toHaveAttribute( 'href', '/me/security/two-step-auth' );
	} );
} );
