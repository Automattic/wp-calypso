/**
 * External  dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { assert } from 'chai';
import { stub, spy } from 'sinon';
import qs from 'qs';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import { sitesList, dailyPromptPost } from './fixtures';

describe( 'DailyPostButton', () => {
	const SitesPopover = props => <span { ...props } />;
	const pageSpy = spy();
	let DailyPostButton;

	useMockery( ( mockery ) => {
		const getPrimary = stub();
		const statsMocks = {
			recordAction: noop,
			recordGaEvent: noop,
			recordTrackForPost: noop,
		};
		mockery.registerMock( 'reader/stats', statsMocks );

		getPrimary.onFirstCall().returns( );
		getPrimary.returns( sitesList );
		mockery.registerMock( 'lib/sites-list', () => {
			return { getPrimary };
		} );

		mockery.registerMock( 'page', pageSpy );
		mockery.registerMock( 'components/sites-popover', SitesPopover );
	} );

	before( () =>{
		DailyPostButton = require( '../index' );
	} );

	describe( 'rendering', () => {
		it( 'does not render if the user does not have any sites', () => {
			const dailyPostPrompt = shallow( <DailyPostButton post={ dailyPromptPost }/> );
			assert.isNull( dailyPostPrompt.type() );
		} );

		it( 'renders as an li tag by default', () => {
			const renderAsLi = shallow( <DailyPostButton post={ dailyPromptPost } /> );
			assert.equal( 'li', renderAsLi.type() );
		} );

		it( 'renders as the tag specified in props tagName', () => {
			const renderAsSpan = shallow( <DailyPostButton tagName="span" post={ dailyPromptPost } /> );
			assert.equal( 'span', renderAsSpan.type() );
		} );

		it( 'hides the sites list by default', () => {
			const inactive = shallow( <DailyPostButton post={ dailyPromptPost } /> );
			assert.isFalse( inactive.containsMatchingElement( <SitesPopover /> ) );
		} );

		it( 'shows the sites list if showingMenu is true', () => {
			const active = shallow( <DailyPostButton post={ dailyPromptPost } /> ).setState( { showingMenu: true } );
			assert.isTrue( active.containsMatchingElement( <SitesPopover /> ) );
		} );
	} );

	describe( 'creating a post', () => {
		let prompt;
		before( () => {
			prompt = shallow( <DailyPostButton post={ dailyPromptPost } /> );
		} );
		it( 'redirects to the choosen site', () => {
			prompt.instance().pickSiteToPostTo( 'calypsop2.wordpress.com' );
			assert.isTrue( pageSpy.calledWithMatch( /post\/calypsop2.wordpress.com?/ ) );
		} );

		it( 'adds the daily post prompt attributes to the redirect url', () => {
			prompt.instance().pickSiteToPostTo( 'calypsop2.wordpress.com' );
			const pageArgs = pageSpy.lastCall.args[ 0 ];
			const query = qs.parse( pageArgs.split( '?' )[ 1 ] );
			const { title, URL } = dailyPromptPost;
			assert.deepEqual( query, { title: `Daily Prompt: ${ title }`, url: URL } );
		} );
	} );
} );
