import { shallow } from 'enzyme';
import HappychatButton from 'calypso/components/happychat/button';
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import {
	CALYPSO_CONTACT,
	JETPACK_CONTACT_SUPPORT,
	JETPACK_SUPPORT,
	SUPPORT_ROOT,
} from 'calypso/lib/url/support';
import { HappinessSupport } from '..';

const noop = () => {};

describe( 'HappinessSupport', () => {
	let wrapper;
	const translate = ( content ) => `Translated: ${ content }`;

	beforeEach( () => {
		wrapper = shallow( <HappinessSupport translate={ translate } recordTracksEvent={ noop } /> );
	} );

	test( 'should render translated heading content', () => {
		const heading = wrapper.find( 'h3' );
		expect( heading ).toHaveLength( 1 );
		expect( heading.props().children ).toEqual( 'Translated: Priority support' );
	} );

	test( 'should render translated help content', () => {
		const content = wrapper.find( 'p.happiness-support__description' );
		expect( content ).toHaveLength( 1 );
		expect( content.props().children ).toEqual(
			'Translated: {{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site and your\xA0account.'
		);
	} );

	test( 'should render a translated support button', () => {
		expect(
			wrapper.find( 'ForwardRef(Button).happiness-support__support-button>span' ).props().children
		).toEqual( 'Translated: Support documentation' );
	} );

	test( 'should render a support button with link to SUPPORT_ROOT if it is not for JetPack', () => {
		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isJetpack={ false } />
		);
		expect(
			wrapper.find( 'ForwardRef(Button).happiness-support__support-button' ).props().href
		).toEqual( SUPPORT_ROOT );
	} );

	test( 'should render a support button with link to JETPACK_SUPPORT if it is for JetPack', () => {
		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isJetpack={ true } />
		);
		expect( wrapper.find( 'ForwardRef(Button)' ).last().prop( 'href' ) ).toEqual( JETPACK_SUPPORT );
	} );

	test( 'should have is-placeholder className only if it is a placeholder', () => {
		expect( wrapper.find( '.happiness-support' ).hasClass( 'is-placeholder' ) ).toBe( false );

		wrapper = shallow(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isPlaceholder={ true } />
		);
		expect( wrapper.find( '.happiness-support' ).hasClass( 'is-placeholder' ) ).toBe( true );
	} );

	test( 'should render a <HappychatConnection /> when showLiveChat prop is true', () => {
		wrapper = shallow(
			<HappinessSupport
				translate={ translate }
				recordTracksEvent={ noop }
				showLiveChatButton={ true }
			/>
		);
		expect( wrapper.find( HappychatConnection ) ).toHaveLength( 1 );
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
			expect( wrapper.find( HappychatButton ) ).toHaveLength( 1 );

			// false cases
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( HappychatButton ) ).toHaveLength( 0 );

			wrapper = shallow( <HappinessSupport { ...props } showLiveChatButton={ true } /> );
			expect( wrapper.find( HappychatButton ) ).toHaveLength( 0 );

			wrapper = shallow( <HappinessSupport { ...props } showLiveChatButton={ false } /> );
			expect( wrapper.find( HappychatButton ) ).toHaveLength( 0 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ true } liveChatAvailable={ false } />
			);
			expect( wrapper.find( HappychatButton ) ).toHaveLength( 0 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ true } />
			);
			expect( wrapper.find( HappychatButton ) ).toHaveLength( 0 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ false } />
			);
			expect( wrapper.find( HappychatButton ) ).toHaveLength( 0 );
		} );

		test( 'should render translated content', () => {
			expect( wrapper.find( HappychatButton ).props().children ).toEqual(
				'Translated: Ask a question'
			);
		} );

		test( 'should fire tracks event with given event name when clicked', () => {
			const recordTracksEvent = jest.fn();

			wrapper = shallow(
				<HappinessSupport
					translate={ translate }
					recordTracksEvent={ recordTracksEvent }
					showLiveChatButton={ true }
					liveChatAvailable={ true }
					liveChatButtonEventName="test:eventName"
				/>
			);

			expect( recordTracksEvent ).not.toHaveBeenCalled();
			wrapper.find( HappychatButton ).simulate( 'click' );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'test:eventName' );
		} );

		test( 'should not fire tracks event when no event name is passed even if clicked', () => {
			const recordTracksEvent = jest.fn();

			wrapper = shallow(
				<HappinessSupport
					translate={ translate }
					recordTracksEvent={ recordTracksEvent }
					showLiveChatButton={ true }
					liveChatAvailable={ true }
				/>
			);

			expect( recordTracksEvent ).not.toHaveBeenCalled();
			wrapper.find( HappychatButton ).simulate( 'click' );
			expect( recordTracksEvent ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Contact button', () => {
		const selector = 'ForwardRef(Button).happiness-support__contact-button';
		const props = {
			translate,
			recordTracksEvent: noop,
		};

		test( 'should be rendered unless LiveChat button shows up', () => {
			// should not be displayed here
			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ true } liveChatAvailable={ true } />
			);
			expect( wrapper.find( selector ) ).toHaveLength( 0 );

			// should be rendered in the following cases
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( selector ) ).toHaveLength( 1 );

			wrapper = shallow( <HappinessSupport { ...props } showLiveChatButton={ true } /> );
			expect( wrapper.find( selector ) ).toHaveLength( 1 );

			wrapper = shallow( <HappinessSupport { ...props } showLiveChatButton={ false } /> );
			expect( wrapper.find( selector ) ).toHaveLength( 1 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ true } liveChatAvailable={ false } />
			);
			expect( wrapper.find( selector ) ).toHaveLength( 1 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ true } />
			);
			expect( wrapper.find( selector ) ).toHaveLength( 1 );

			wrapper = shallow(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ false } />
			);
			expect( wrapper.find( selector ) ).toHaveLength( 1 );
		} );

		test( 'should be rendered with link to CALYPSO_CONTACT if it is not for JetPack', () => {
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( selector ).prop( 'href' ) ).toEqual( CALYPSO_CONTACT );
		} );

		test( 'should be rendered with link to JETPACK_CONTACT_SUPPORT if it is for JetPack', () => {
			wrapper = shallow( <HappinessSupport { ...props } isJetpack={ true } /> );
			expect( wrapper.find( selector ).prop( 'href' ) ).toEqual( JETPACK_CONTACT_SUPPORT );
		} );

		test( 'should render translated content', () => {
			wrapper = shallow( <HappinessSupport { ...props } /> );
			expect( wrapper.find( selector ).props().children ).toEqual( 'Translated: Ask a question' );
		} );
	} );
} );
