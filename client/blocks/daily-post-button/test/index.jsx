/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import pageSpy from 'page';
import { parse } from 'qs';
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
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'page', () => require( 'sinon' ).spy() );
const markPostSeen = jest.fn();

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
			assert.isNull( dailyPostPrompt.type() );
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
			assert.equal( 'span', renderAsSpan.type() );
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
			assert.equal( 'span', renderAsSpan.type() );
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
			assert.isTrue( pageSpy.calledWithMatch( /post\/apps.wordpress.com?/ ) );
		} );

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
			return new Promise( resolve => {
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
			const pageArgs = pageSpy.lastCall.args[ 0 ];
			const query = parse( pageArgs.split( '?' )[ 1 ] );
			const { title, URL } = dailyPromptPost;
			assert.deepEqual( query, { title: `Daily Prompt: ${ title }`, url: URL } );
		} );
	} );
} );
