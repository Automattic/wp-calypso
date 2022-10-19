/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	CALYPSO_CONTACT,
	JETPACK_CONTACT_SUPPORT,
	JETPACK_SUPPORT,
	SUPPORT_ROOT,
} from 'calypso/lib/url/support';
import { HappinessSupport } from '..';

jest.mock( 'calypso/components/happychat/connection-connected', () => () => (
	<div data-testid="happychat-connection" />
) );
jest.mock( 'calypso/components/happychat/button', () => ( { onClick, children } ) => (
	<button data-testid="happychat-button" onClick={ onClick }>
		{ children }
	</button>
) );

const noop = () => {};

describe( 'HappinessSupport', () => {
	const translate = ( content ) => `Translated: ${ content }`;

	test( 'should render translated heading content', () => {
		render( <HappinessSupport translate={ translate } recordTracksEvent={ noop } /> );
		const heading = screen.getByRole( 'heading', { level: 3 } );
		expect( heading ).toBeVisible();
		expect( heading ).toHaveTextContent( 'Translated: Priority support' );
	} );

	test( 'should render translated help content', () => {
		render( <HappinessSupport translate={ translate } recordTracksEvent={ noop } /> );
		const desc =
			'Translated: {{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site and your account.';
		const content = screen.getByText( desc );
		expect( content ).toBeVisible();
	} );

	test( 'should render a translated support button', () => {
		render( <HappinessSupport translate={ translate } recordTracksEvent={ noop } /> );
		expect(
			screen.getByRole( 'link', { name: 'Translated: Support documentation' } )
		).toBeVisible();
	} );

	test( 'should render a support button with link to SUPPORT_ROOT if it is not for Jetpack', () => {
		render(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isJetpack={ false } />
		);
		expect(
			screen.getByRole( 'link', { name: 'Translated: Support documentation' } )
		).toHaveAttribute( 'href', SUPPORT_ROOT );
	} );

	test( 'should render a support button with link to JETPACK_SUPPORT if it is for JetPack', () => {
		render( <HappinessSupport translate={ translate } recordTracksEvent={ noop } isJetpack /> );
		expect(
			screen.getByRole( 'link', { name: 'Translated: Support documentation' } )
		).toHaveAttribute( 'href', JETPACK_SUPPORT );
	} );

	test( 'should have is-placeholder className only if it is a placeholder', () => {
		const { rerender, container } = render(
			<HappinessSupport
				translate={ translate }
				recordTracksEvent={ noop }
				isPlaceholder={ false }
			/>
		);
		expect( container.firstChild ).not.toHaveClass( 'is-placeholder' );

		rerender(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } isPlaceholder />
		);
		expect( container.firstChild ).toHaveClass( 'is-placeholder' );
	} );

	test( 'should render a <HappychatConnection /> when showLiveChat prop is true', () => {
		render(
			<HappinessSupport translate={ translate } recordTracksEvent={ noop } showLiveChatButton />
		);
		expect( screen.getByTestId( 'happychat-connection' ) ).toBeVisible();
	} );

	describe( 'LiveChat button', () => {
		const props = {
			translate,
			recordTracksEvent: noop,
		};

		test( 'should be rendered only when showLiveChatButton prop is true and LiveChat is available', () => {
			const { rerender } = render(
				<HappinessSupport { ...props } showLiveChatButton liveChatAvailable />
			);
			// should be rendered here
			expect( screen.getByTestId( 'happychat-button' ) ).toBeVisible();

			// false cases
			const queryHappychatButton = () => screen.queryByTestId( 'happychat-button' );
			rerender( <HappinessSupport { ...props } /> );
			expect( queryHappychatButton() ).not.toBeInTheDocument();

			rerender( <HappinessSupport { ...props } showLiveChatButton /> );
			expect( queryHappychatButton() ).not.toBeInTheDocument();

			rerender( <HappinessSupport { ...props } showLiveChatButton={ false } /> );
			expect( queryHappychatButton() ).not.toBeInTheDocument();

			rerender( <HappinessSupport { ...props } showLiveChatButton liveChatAvailable={ false } /> );
			expect( queryHappychatButton() ).not.toBeInTheDocument();

			rerender( <HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable /> );
			expect( queryHappychatButton() ).not.toBeInTheDocument();

			rerender(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ false } />
			);
			expect( queryHappychatButton() ).not.toBeInTheDocument();
		} );

		test( 'should render translated content', () => {
			render( <HappinessSupport { ...props } showLiveChatButton liveChatAvailable /> );
			expect( screen.getByTestId( 'happychat-button' ) ).toHaveTextContent(
				'Translated: Ask a question'
			);
		} );

		test( 'should fire tracks event with given event name when clicked', async () => {
			const user = userEvent.setup();
			const recordTracksEvent = jest.fn();

			render(
				<HappinessSupport
					translate={ translate }
					recordTracksEvent={ recordTracksEvent }
					showLiveChatButton
					liveChatAvailable
					liveChatButtonEventName="test:eventName"
				/>
			);

			expect( recordTracksEvent ).not.toHaveBeenCalled();
			await user.click( screen.getByTestId( 'happychat-button' ) );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'test:eventName' );
		} );

		test( 'should not fire tracks event when no event name is passed even if clicked', async () => {
			const user = userEvent.setup();
			const recordTracksEvent = jest.fn();

			render(
				<HappinessSupport
					translate={ translate }
					recordTracksEvent={ recordTracksEvent }
					showLiveChatButton
					liveChatAvailable
				/>
			);

			expect( recordTracksEvent ).not.toHaveBeenCalled();
			await user.click( screen.getByTestId( 'happychat-button' ) );
			expect( recordTracksEvent ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Contact button', () => {
		const props = {
			translate,
			recordTracksEvent: noop,
		};
		const linkName = 'Translated: Ask a question';
		const getContactLink = () => screen.getByRole( 'link', { name: linkName } );

		test( 'should be rendered unless LiveChat button shows up', () => {
			// should not be displayed here
			const { rerender } = render(
				<HappinessSupport { ...props } showLiveChatButton liveChatAvailable />
			);
			expect( screen.queryByRole( 'link', { name: linkName } ) ).not.toBeInTheDocument();

			// should be rendered in the following cases

			rerender( <HappinessSupport { ...props } /> );
			expect( getContactLink() ).toBeVisible();

			rerender( <HappinessSupport { ...props } showLiveChatButton /> );
			expect( getContactLink() ).toBeVisible();

			rerender( <HappinessSupport { ...props } showLiveChatButton={ false } /> );
			expect( getContactLink() ).toBeVisible();

			rerender( <HappinessSupport { ...props } showLiveChatButton liveChatAvailable={ false } /> );
			expect( getContactLink() ).toBeVisible();

			rerender( <HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable /> );
			expect( getContactLink() ).toBeVisible();

			rerender(
				<HappinessSupport { ...props } showLiveChatButton={ false } liveChatAvailable={ false } />
			);
			expect( getContactLink() ).toBeVisible();
		} );

		test( 'should be rendered with link to CALYPSO_CONTACT if it is not for Jetpack', () => {
			render( <HappinessSupport { ...props } /> );
			expect( getContactLink() ).toHaveAttribute( 'href', CALYPSO_CONTACT );
		} );

		test( 'should be rendered with link to JETPACK_CONTACT_SUPPORT if it is for Jetpack', () => {
			render( <HappinessSupport { ...props } isJetpack /> );
			expect( getContactLink() ).toHaveAttribute( 'href', JETPACK_CONTACT_SUPPORT );
		} );
	} );
} );
