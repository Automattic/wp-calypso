/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import pageSpy from 'page';
import qs from 'qs';
import React from 'react';

/**
 * Internal dependencies
 */
import { DailyPostButton } from '../index';
import { sites, dailyPromptPost } from './fixtures';

jest.mock( 'reader/stats', () => ( {
	pageViewForPost: () => {},
	recordAction: () => {},
	recordGaEvent: () => {},
	recordTrackForPost: () => {},
} ) );
jest.mock( 'lib/analytics', () => ( {
	mc: {
		bumpStat: () => {},
	},
} ) );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'page', () => require( 'sinon' ).spy() );

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
				/>
			);
			expect( 'span' ).toEqual( renderAsSpan.type() );
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
				/>
			);
			expect( 'span' ).toEqual( renderAsSpan.type() );
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
				/>
			);
			dailyPostButton.simulate( 'click', { preventDefault: noop } );
			expect( pageSpy.calledWithMatch( /post\/apps.wordpress.com?/ ) ).toBe( true );
		} );

		test( 'shows the site selector if the user has more than one site', done => {
			const dailyPostButton = shallow(
				<DailyPostButton
					tagName="span"
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ true }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ false }
				/>
			);
			dailyPostButton.instance().renderSitesPopover = done;
			dailyPostButton.simulate( 'click', { preventDefault: noop } );
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
				/>
			);
			prompt.instance().openEditorWithSite( 'apps.wordpress.com' );
			const pageArgs = pageSpy.lastCall.args[ 0 ];
			const query = qs.parse( pageArgs.split( '?' )[ 1 ] );
			const { title, URL } = dailyPromptPost;
			expect( query ).toEqual( { title: `Daily Prompt: ${ title }`, url: URL } );
		} );
	} );
} );
