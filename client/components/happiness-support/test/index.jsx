/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { HappinessSupport } from '..';
import support from 'lib/url/support';
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection';

describe( 'HappinessSupport', function() {
	let wrapper;
	const translate = content => `Translated: ${ content }`;

	beforeEach( function() {
		wrapper = shallow( <HappinessSupport translate={ translate } recordTracksEvent={ noop } /> );
	} );

	it( 'should render translated heading content', function() {
		const heading = wrapper.find( 'h3' );
		expect( heading ).to.have.length( 1 );
		expect( heading.props().children ).to.equal(
			'Translated: Enjoy priority support from our Happiness Engineers'
		);
	} );

	it( 'should render translated help content', function() {
		const content = wrapper.find( 'p.happiness-support__text' );
		expect( content ).to.have.length( 1 );
		expect( content.props().children ).to.equal(
			'Translated: {{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site, your account or how to do just about anything.' // eslint-disable-line max-len
		);
	} );

	it( 'should render a translated support button', function() {
		expect( wrapper.find( 'Button.happiness-support__support-button' ).props().children ).to.equal(
			'Translated: Search our support site'
		);
	} );

	it( 'should render a support button with link to SUPPORT_ROOT if it is not for JetPack', function() {
		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isJetpack={ false } />
		);
		expect( wrapper.find( 'Button.happiness-support__support-button' ).props().href ).to.equal(
			support.SUPPORT_ROOT
		);
	} );

	it( 'should render a support button with link to JETPACK_SUPPORT if it is for JetPack', function() {
		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isJetpack={ true } />
		);
		expect(
			wrapper
				.find( 'Button' )
				.last()
				.prop( 'href' )
		).to.equal( support.JETPACK_SUPPORT );
	} );

	it( 'should have is-placeholder className only if it is a placeholder', function() {
		expect( wrapper.find( '.happiness-support' ).hasClass( 'is-placeholder' ) ).to.be.false;

		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isPlaceholder={ true } />
		);
		expect( wrapper.find( '.happiness-support' ).hasClass( 'is-placeholder' ) ).to.be.true;
	} );

	it( 'should render a <HappychatConnection /> when showLiveChat prop is true', function() {
		wrapper = shallow(
			<HappinessSupport
				translate={ translate }
				recordTracksEvent={ noop }
				showLiveChatButton={ true }
			/>
		);
		expect( wrapper.find( HappychatConnection ) ).to.have.length( 1 );
	} );

	describe( 'LiveChat button', function() {
		const props = {
			translate,
			recordTracksEvent: noop,
		};

		beforeEach( function() {
			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ true } liveChatAvailable={ true } />
			);
		} );

		it( 'should be rendered only when showLiveChatButton prop is true and LiveChat is available', function() {
			// should be rendered here
			expect( wrapper.find( HappychatButton ) ).to.have.length( 1 );

			// false cases
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( HappychatButton ) ).to.have.length( 0 );

			wrapper = shallow( <HappinessSupport { ...props } showLiveChatButton={ true } /> );
			expect( wrapper.find( HappychatButton ) ).to.have.length( 0 );

			wrapper = shallow( <HappinessSupport { ...props } showLiveChatButton={ false } /> );
			expect( wrapper.find( HappychatButton ) ).to.have.length( 0 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ true } liveChatAvailable={ false } />
			);
			expect( wrapper.find( HappychatButton ) ).to.have.length( 0 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ true } />
			);
			expect( wrapper.find( HappychatButton ) ).to.have.length( 0 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ false } />
			);
			expect( wrapper.find( HappychatButton ) ).to.have.length( 0 );
		} );

		it( 'should render translated content', function() {
			expect( wrapper.find( HappychatButton ).props().children ).to.equal(
				'Translated: Ask a question'
			);
		} );

		it( 'should fire tracks event with given event name when clicked', function() {
			const recordTracksEvent = spy();

			wrapper = shallow(
				<HappinessSupport
					translate={ translate }
					recordTracksEvent={ recordTracksEvent }
					showLiveChatButton={ true }
					liveChatAvailable={ true }
					liveChatButtonEventName="test:eventName"
				/>
			);

			expect( recordTracksEvent ).not.to.be.called;
			wrapper.find( HappychatButton ).simulate( 'click' );
			expect( recordTracksEvent ).to.be.calledWith( 'test:eventName' );
		} );

		it( 'should not fire tracks event when no event name is passed even if clicked', function() {
			const recordTracksEvent = spy();

			wrapper = shallow(
				<HappinessSupport
					translate={ translate }
					recordTracksEvent={ recordTracksEvent }
					showLiveChatButton={ true }
					liveChatAvailable={ true }
				/>
			);

			expect( recordTracksEvent ).not.to.be.called;
			wrapper.find( HappychatButton ).simulate( 'click' );
			expect( recordTracksEvent ).not.to.be.called;
		} );
	} );

	describe( 'Contact button', function() {
		const selector = 'Button.happiness-support__contact-button';
		const props = {
			translate,
			recordTracksEvent: noop,
		};

		it( 'should be rendered unless LiveChat button shows up', function() {
			// should not be displayed here
			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ true } liveChatAvailable={ true } />
			);
			expect( wrapper.find( selector ) ).to.have.length( 0 );

			// should be rendered in the following cases
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( selector ) ).to.have.length( 1 );

			wrapper = shallow( <HappinessSupport { ...props } showLiveChatButton={ true } /> );
			expect( wrapper.find( selector ) ).to.have.length( 1 );

			wrapper = shallow( <HappinessSupport { ...props } showLiveChatButton={ false } /> );
			expect( wrapper.find( selector ) ).to.have.length( 1 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ true } liveChatAvailable={ false } />
			);
			expect( wrapper.find( selector ) ).to.have.length( 1 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ true } />
			);
			expect( wrapper.find( selector ) ).to.have.length( 1 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ false } />
			);
			expect( wrapper.find( selector ) ).to.have.length( 1 );
		} );

		it( 'should be rendered with link to CALYPSO_CONTACT if it is not for JetPack', function() {
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( selector ).prop( 'href' ) ).to.equal( support.CALYPSO_CONTACT );
		} );

		it( 'should be rendered with link to JETPACK_CONTACT_SUPPORT if it is for JetPack', function() {
			wrapper = shallow( <HappinessSupport { ...props } isJetpack={ true } /> );
			expect( wrapper.find( selector ).prop( 'href' ) ).to.equal( support.JETPACK_CONTACT_SUPPORT );
		} );

		it( 'should render translated content', function() {
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( selector ).props().children ).to.equal( 'Translated: Ask a question' );
		} );
	} );
} );
