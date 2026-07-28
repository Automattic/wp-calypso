/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReaderUnreadCount from '../reader-unread-count';

describe( 'ReaderUnreadCount', () => {
	test( 'should render nothing when there is no count', () => {
		const { container } = render( <ReaderUnreadCount /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render nothing when count is zero', () => {
		const { container } = render( <ReaderUnreadCount count={ 0 } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render a compact badge with the count', () => {
		const { container } = render( <ReaderUnreadCount count={ 1000 } /> );
		expect( container.querySelector( '.a8c-count' ) ).toHaveTextContent( '1K' );
	} );

	test( 'should describe the 30-day unread window as the accessible name', () => {
		const { container } = render( <ReaderUnreadCount count={ 4 } /> );
		expect( container.querySelector( '.a8c-count' ) ).toHaveAccessibleName( '4 unread (30 days)' );
	} );

	test( 'should show the 30-day tooltip on keyboard focus', async () => {
		const user = userEvent.setup();
		const { container } = render( <ReaderUnreadCount count={ 4 } /> );
		const badge = container.querySelector( '.a8c-count' ) as HTMLElement;

		await user.tab();
		expect( badge ).toHaveFocus();
		expect( await screen.findByText( '4 unread (30 days)' ) ).toBeVisible();
	} );
} );
