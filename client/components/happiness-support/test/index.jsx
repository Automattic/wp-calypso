/** @jest-environment jsdom */
import { JETPACK_CONTACT_SUPPORT, JETPACK_SUPPORT, SUPPORT_ROOT } from '@automattic/urls';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HappinessSupport } from '..';

jest.mock( 'calypso/components/support-button', () => ( { onClick, children } ) => (
	<button data-testid="support-button" onClick={ onClick }>
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

	describe( 'LiveChat button', () => {
		const props = {
			translate,
			recordTracksEvent: noop,
		};

		test( 'should be rendered only when not dealing with Jetpack site', () => {
			const { rerender } = render( <HappinessSupport { ...props } /> );
			// should be rendered here
			expect( screen.getByTestId( 'support-button' ) ).toBeVisible();

			rerender( <HappinessSupport { ...props } isJetpack={ false } /> );
			expect( screen.getByTestId( 'support-button' ) ).toBeVisible();
		} );

		test( 'should render translated content', () => {
			render( <HappinessSupport { ...props } /> );
			expect( screen.getByTestId( 'support-button' ) ).toHaveTextContent(
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
					contactButtonEventName="test:eventName"
				/>
			);

			expect( recordTracksEvent ).not.toHaveBeenCalled();
			await user.click( screen.getByTestId( 'support-button' ) );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'test:eventName' );
		} );

		test( 'should not fire tracks event when no event name is passed even if clicked', async () => {
			const user = userEvent.setup();
			const recordTracksEvent = jest.fn();

			render(
				<HappinessSupport translate={ translate } recordTracksEvent={ recordTracksEvent } />
			);

			expect( recordTracksEvent ).not.toHaveBeenCalled();
			await user.click( screen.getByTestId( 'support-button' ) );
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

		test( 'should be rendered with link to JETPACK_CONTACT_SUPPORT if it is for Jetpack', () => {
			render( <HappinessSupport { ...props } isJetpack /> );
			expect( getContactLink() ).toHaveAttribute( 'href', JETPACK_CONTACT_SUPPORT );
		} );
	} );
} );
