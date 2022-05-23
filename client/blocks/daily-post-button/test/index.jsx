/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import pageSpy from 'page';
import { parse } from 'qs';
import { DailyPostButton } from '../index';
import { sites, dailyPromptPost } from './fixtures';

jest.mock( 'calypso/reader/stats', () => ( {
	pageViewForPost: () => {},
	recordAction: () => {},
	recordGaEvent: () => {},
	recordTrackForPost: () => {},
} ) );
jest.mock( 'page', () => jest.fn() );
const markPostSeen = jest.fn();
const noop = () => {};

describe( 'DailyPostButton', () => {
	const [ sampleUserSite, sampleReadingSite ] = sites;

	describe( 'rendering', () => {
		test( 'does not render if the user can not participate (does not have any sites)', () => {
			const dailyPostPrompt = shallow(
				<DailyPostButton
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ false }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ false }
					markPostSeen={ markPostSeen }
				/>
			);
			expect( dailyPostPrompt.type() ).toBeNull();
		} );

		test( 'renders as a span tag by default', () => {
			const renderAsSpan = shallow(
				<DailyPostButton
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ true }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ true }
					markPostSeen={ markPostSeen }
				/>
			);
			expect( renderAsSpan.type() ).toEqual( 'span' );
		} );

		test( 'renders as the tag specified in props tagName', () => {
			const renderAsSpan = shallow(
				<DailyPostButton
					tagName="span"
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ true }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ true }
					markPostSeen={ markPostSeen }
				/>
			);
			expect( renderAsSpan.type() ).toEqual( 'span' );
		} );
	} );

	describe( 'clicking daily post button', () => {
		test( 'redirects to primary site if the user only has one site', () => {
			const dailyPostButton = shallow(
				<DailyPostButton
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ true }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ true }
					markPostSeen={ markPostSeen }
				/>
			);
			dailyPostButton.simulate( 'click', { preventDefault: noop } );
			expect( pageSpy ).toHaveBeenCalledWith(
				expect.stringMatching( /post\/apps.wordpress.com?/ )
			);
		} );

		// eslint-disable-next-line jest/expect-expect
		test( 'shows the site selector if the user has more than one site', () => {
			const dailyPostButton = shallow(
				<DailyPostButton
					tagName="span"
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ true }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ false }
					markPostSeen={ markPostSeen }
				/>
			);
			return new Promise( ( resolve ) => {
				dailyPostButton.instance().renderSitesPopover = resolve;
				dailyPostButton.simulate( 'click', { preventDefault: noop } );
			} );
		} );
	} );

	describe( 'starting a post', () => {
		test( 'adds the daily post prompt attributes to the redirect url', () => {
			const prompt = shallow(
				<DailyPostButton
					tagName="span"
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ true }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ true }
					markPostSeen={ markPostSeen }
				/>
			);
			prompt.instance().openEditorWithSite( 'apps.wordpress.com' );
			const pageArgs = pageSpy.mock.lastCall[ 0 ];
			const query = parse( pageArgs.split( '?' )[ 1 ] );
			const { title, URL } = dailyPromptPost;
			expect( query ).toEqual( { title: `Daily Prompt: ${ title }`, url: URL } );
		} );
	} );
} );
