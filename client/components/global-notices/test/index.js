/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import deepFreeze from 'deep-freeze';
import { GlobalNotices } from '..';

const baseProps = deepFreeze( {
	storeNotices: [],
	removeNotice: jest.fn(),
} );

beforeEach( jest.clearAllMocks );

describe( '<GlobalNotices />', () => {
	test( 'should not render without notices', () => {
		const { container } = render( <GlobalNotices { ...baseProps } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render notices with the expected structure', () => {
		const notices = [
			{
				noticeId: 'testing-notice',
				showDismiss: true,
				status: 'is-success',
				text: 'A test notice',
			},
		];
		const { container } = render( <GlobalNotices { ...baseProps } storeNotices={ notices } /> );
		expect( container.firstChild ).toHaveClass( 'global-notices' );
		expect( container.firstChild ).toHaveAttribute( 'id', 'overlay-notices' );
		expect( screen.queryAllByRole( 'status' ) ).toHaveLength( 1 );
		expect( container ).toMatchSnapshot();
	} );

	test( 'should use provided id', () => {
		const notices = [
			{
				noticeId: 'testing-notice',
				showDismiss: true,
				status: 'is-success',
				text: 'A test notice',
			},
		];
		const { container } = render(
			<GlobalNotices { ...baseProps } storeNotices={ notices } id="test-id" />
		);
		expect( container.firstChild ).toHaveAttribute( 'id', 'test-id' );
	} );

	test( 'should call dismissals', async () => {
		const notices = [
			{
				noticeId: 'testing-notice',
				onDismissClick: jest.fn(),
				showDismiss: true,
				status: 'is-success',
				text: 'A test notice',
			},
		];

		render( <GlobalNotices { ...baseProps } storeNotices={ notices } id="test-id" /> );

		await userEvent.click( screen.getByRole( 'button' ) );

		expect( notices[ 0 ].onDismissClick ).toHaveBeenCalledTimes( 1 );
		expect( baseProps.removeNotice ).toHaveBeenCalledTimes( 1 );
		expect( baseProps.removeNotice ).toHaveBeenCalledWith( 'testing-notice' );
	} );
} );
