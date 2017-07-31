/** @format */
jest.mock( 'reader/stats', () => ( {
	pageViewForPost: () => {},
	recordAction: () => {},
	recordGaEvent: () => {},
	recordTrackForPost: () => {},
} ) );
jest.mock( 'lib/analytics', () => ( {
	mc: {
		bumpStat: () => {}
	}
} ) );
jest.mock( 'page', () => require( 'sinon' ).spy() );
jest.mock( 'components/sites-popover', () => {
	const React = require( 'react' );
	return props => <span { ...props } />;
} );

/**
 * External  dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { assert } from 'chai';
import qs from 'qs';
import { noop } from 'lodash';
import pageSpy from 'page';

/**
 * Internal dependencies
 */
import { DailyPostButton } from '../index';
import { sites, dailyPromptPost } from './fixtures';

describe( 'DailyPostButton', () => {
	const [ sampleUserSite, sampleReadingSite ] = sites;

	describe( 'rendering', () => {
		it( 'does not render if the user can not participate (does not have any sites)', () => {
			const dailyPostPrompt = shallow(
				<DailyPostButton
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ false }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ false }
				/>
			);
			assert.isNull( dailyPostPrompt.type() );
		} );

		it( 'renders as a span tag by default', () => {
			const renderAsSpan = shallow(
				<DailyPostButton
					post={ dailyPromptPost }
					site={ sampleReadingSite }
					canParticipate={ true }
					primarySiteSlug={ sampleUserSite.slug }
					onlyOneSite={ true }
				/>
			);
			assert.equal( 'span', renderAsSpan.type() );
		} );

		it( 'renders as the tag specified in props tagName', () => {
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
			assert.equal( 'span', renderAsSpan.type() );
		} );
	} );

	describe( 'clicking daily post button', () => {
		it( 'redirects to primary site if the user only has one site', () => {
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
			assert.isTrue( pageSpy.calledWithMatch( /post\/apps.wordpress.com?/ ) );
		} );

		it( 'shows the site selector if the user has more than one site', done => {
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
		it( 'adds the daily post prompt attributes to the redirect url', () => {
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
			assert.deepEqual( query, { title: `Daily Prompt: ${ title }`, url: URL } );
		} );
	} );
} );
