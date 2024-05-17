/**
 * @jest-environment jsdom
 */
import pageSpy from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parse } from 'qs';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { DailyPostButton } from '../index';
import { sites, dailyPromptPost } from './fixtures';

jest.mock( 'calypso/reader/stats', () => ( {
	pageViewForPost: () => {},
	recordAction: () => {},
	recordGaEvent: () => {},
	recordTrackForPost: () => {},
} ) );
jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'calypso/components/sites-popover', () => () => <div data-testid="sites-popover" /> );

const markPostSeen = jest.fn();

const render = ( el, options ) => renderWithProvider( el, { ...options, reducers: { ui } } );

describe( 'DailyPostButton', () => {
	const [ sampleUserSite, sampleReadingSite ] = sites;

	describe( 'rendering', () => {
		test( 'does not render if the user can not participate (does not have any sites)', () => {
			const { container } = render(
				<DailyPostButton
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ false }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ false }
					markPostSeen={ markPostSeen }
				/>
			);
			expect( container ).toBeEmptyDOMElement();
		} );

		test( 'renders as a span tag by default', () => {
			const { container } = render(
				<DailyPostButton
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite
					markPostSeen={ markPostSeen }
				/>
			);

			expect( container.firstChild ).toHaveClass( 'daily-post-button' );
			expect( container.firstChild.tagName ).toBe( 'SPAN' );
		} );

		test( 'renders as the tag specified in props tagName', () => {
			const { container } = render(
				<DailyPostButton
					tagName="article"
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite
					markPostSeen={ markPostSeen }
				/>
			);

			expect( container.firstChild.tagName ).toBe( 'ARTICLE' );
		} );
	} );

	describe( 'clicking daily post button', () => {
		test( 'redirects to primary site if the user only has one site', async () => {
			render(
				<DailyPostButton
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite
					markPostSeen={ markPostSeen }
				/>
			);

			const btn = screen.getByRole( 'button' );
			await userEvent.click( btn );
			expect( pageSpy ).toHaveBeenCalledWith(
				expect.stringContaining( 'post/apps.wordpress.com' )
			);
		} );

		test( 'shows the site selector if the user has more than one site', async () => {
			render(
				<DailyPostButton
					tagName="span"
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ false }
					markPostSeen={ markPostSeen }
				/>
			);

			expect( screen.queryByTestId( 'sites-popover' ) ).not.toBeInTheDocument();

			const btn = screen.getByRole( 'button' );
			await userEvent.click( btn );

			await waitFor( () => {
				expect( screen.getByTestId( 'sites-popover' ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'starting a post', () => {
		test( 'adds the daily post prompt attributes to the redirect url', async () => {
			render(
				<DailyPostButton
					tagName="span"
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite
					markPostSeen={ markPostSeen }
				/>
			);

			const btn = screen.getByRole( 'button' );
			await userEvent.click( btn );

			const pageArgs = pageSpy.mock.lastCall[ 0 ];
			const query = parse( pageArgs.split( '?' )[ 1 ] );
			const { title, URL } = dailyPromptPost;
			expect( query ).toEqual( { title: `Daily Prompt: ${ title }`, url: URL } );
		} );
	} );
} );
