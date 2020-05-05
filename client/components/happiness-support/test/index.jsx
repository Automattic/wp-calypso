/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { HappinessSupport } from '..';
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection-connected';
import {
	CALYPSO_CONTACT,
	JETPACK_CONTACT_SUPPORT,
	JETPACK_SUPPORT,
	SUPPORT_ROOT,
} from 'lib/url/support';

describe( 'HappinessSupport', () => {
	let wrapper;
	const translate = ( content ) => `Translated: ${ content }`;

	beforeEach( () => {
		wrapper = shallow( <HappinessSupport translate={ translate } recordTracksEvent={ noop } /> );
	} );

	test( 'should render translated heading content', () => {
		const heading = wrapper.find( 'h3' );
		expect( heading ).to.have.length( 1 );
		expect( heading.props().children ).to.equal( 'Translated: Priority support' );
	} );

	test( 'should render translated help content', () => {
		const content = wrapper.find( 'p.happiness-support__description' );
		expect( content ).to.have.length( 1 );
		expect( content.props().children ).to.equal(
			'Translated: {{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site and your\xA0account.'
		);
	} );

	test( 'should render a translated support button', () => {
		expect(
			wrapper.find( 'Button.happiness-support__support-button>span' ).props().children
		).to.equal( 'Translated: Support documentation' );
	} );

	test( 'should render a support button with link to SUPPORT_ROOT if it is not for JetPack', () => {
		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isJetpack={ false } />
		);
		expect( wrapper.find( 'Button.happiness-support__support-button' ).props().href ).to.equal(
			SUPPORT_ROOT
		);
	} );

	test( 'should render a support button with link to JETPACK_SUPPORT if it is for JetPack', () => {
		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isJetpack={ true } />
		);
		expect( wrapper.find( 'Button' ).last().prop( 'href' ) ).to.equal( JETPACK_SUPPORT );
	} );

	test( 'should have is-placeholder className only if it is a placeholder', () => {
		expect( wrapper.find( '.happiness-support' ).hasClass( 'is-placeholder' ) ).to.be.false;

		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isPlaceholder={ true } />
		);
		expect( wrapper.find( '.happiness-support' ).hasClass( 'is-placeholder' ) ).to.be.true;
	} );

	test( 'should render a <HappychatConnection /> when showLiveChat prop is true', () => {
		wrapper = shallow(
			<HappinessSupport
				translate={ translate }
				recordTracksEvent={ noop }
				showLiveChatButton={ true }
			/>
		);
		expect( wrapper.find( HappychatConnection ) ).to.have.length( 1 );
	} );

	describe( 'LiveChat button', () => {
		const props = {
			translate,
			recordTracksEvent: noop,
		};

		beforeEach( () => {
			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ true } liveChatAvailable={ true } />
			);
		} );

		test( 'should be rendered only when showLiveChatButton prop is true and LiveChat is available', () => {
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

		test( 'should render translated content', () => {
			expect( wrapper.find( HappychatButton ).props().children ).to.equal(
				'Translated: Ask a question'
			);
		} );

		test( 'should fire tracks event with given event name when clicked', () => {
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

		test( 'should not fire tracks event when no event name is passed even if clicked', () => {
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

	describe( 'Contact button', () => {
		const selector = 'Button.happiness-support__contact-button';
		const props = {
			translate,
			recordTracksEvent: noop,
		};

		test( 'should be rendered unless LiveChat button shows up', () => {
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

		test( 'should be rendered with link to CALYPSO_CONTACT if it is not for JetPack', () => {
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( selector ).prop( 'href' ) ).to.equal( CALYPSO_CONTACT );
		} );

		test( 'should be rendered with link to JETPACK_CONTACT_SUPPORT if it is for JetPack', () => {
			wrapper = shallow( <HappinessSupport { ...props } isJetpack={ true } /> );
			expect( wrapper.find( selector ).prop( 'href' ) ).to.equal( JETPACK_CONTACT_SUPPORT );
		} );

		test( 'should render translated content', () => {
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( selector ).props().children ).to.equal( 'Translated: Ask a question' );
		} );
	} );
} );
