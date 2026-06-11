/**
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://my.localhost/" }
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../app/context';
import Notice from '../../components/notice';
import { render } from '../../test-utils';
import { SitesNoticeArbiter } from '../notice-arbiter';

function mockPreferences( preferences: Record< string, unknown > = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: preferences } );
}

function withOptIn( ui: React.ReactElement ) {
	return (
		<AppProvider config={ { ...APP_CONTEXT_DEFAULT_CONFIG, optIn: true } }>{ ui }</AppProvider>
	);
}

describe( '<SitesNoticeArbiter>', () => {
	test( 'renders only the first page candidate when several are eligible', async () => {
		mockPreferences();

		render(
			<SitesNoticeArbiter>
				<Notice>First notice</Notice>
				<Notice>Second notice</Notice>
			</SitesNoticeArbiter>
		);

		expect( await screen.findByText( 'First notice' ) ).toBeVisible();
		expect( screen.queryByText( 'Second notice' ) ).not.toBeInTheDocument();
	} );

	test( 'skips ineligible page candidates', async () => {
		mockPreferences();
		const isEligible: boolean = false;

		render(
			<SitesNoticeArbiter>
				{ isEligible && <Notice>Ineligible notice</Notice> }
				<Notice>Eligible notice</Notice>
			</SitesNoticeArbiter>
		);

		expect( await screen.findByText( 'Eligible notice' ) ).toBeVisible();
	} );

	test( 'renders nothing when no candidate is eligible', async () => {
		mockPreferences();
		const isEligible: boolean = false;

		render(
			<div>
				<span>Page content</span>
				<SitesNoticeArbiter>
					{ isEligible && <Notice>Ineligible notice</Notice> }
				</SitesNoticeArbiter>
			</div>
		);

		expect( await screen.findByText( 'Page content' ) ).toBeVisible();
		expect( screen.queryByText( 'Ineligible notice' ) ).not.toBeInTheDocument();
	} );

	test( 'falls back to the welcome notice when no page candidate is eligible', async () => {
		mockPreferences();

		render( withOptIn( <SitesNoticeArbiter /> ) );

		expect( await screen.findByText( /Welcome to your new Hosting Dashboard/ ) ).toBeVisible();
	} );

	test( 'page candidates outrank shared candidates', async () => {
		mockPreferences();

		render(
			withOptIn(
				<SitesNoticeArbiter>
					<Notice>Page notice</Notice>
				</SitesNoticeArbiter>
			)
		);

		expect( await screen.findByText( 'Page notice' ) ).toBeVisible();
		expect( screen.queryByText( /Welcome to your new Hosting Dashboard/ ) ).not.toBeInTheDocument();
	} );

	test( 'does not promote a shared candidate when a page candidate goes away mid-session', async () => {
		mockPreferences();

		function Harness() {
			const [ isEligible, setIsEligible ] = useState( true );
			return (
				<SitesNoticeArbiter>
					{ isEligible && (
						<Notice onClose={ () => setIsEligible( false ) }>Dismissible notice</Notice>
					) }
				</SitesNoticeArbiter>
			);
		}

		render( withOptIn( <Harness /> ) );

		expect( await screen.findByText( 'Dismissible notice' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: /dismiss/i } ) );

		expect( screen.queryByText( 'Dismissible notice' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /Welcome to your new Hosting Dashboard/ ) ).not.toBeInTheDocument();
	} );
} );
