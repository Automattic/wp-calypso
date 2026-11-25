/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector, useDispatch } from 'react-redux';
import { vi } from 'vitest';
import GlobalNotices from '..';

vi.mock( 'react-redux', () => ( {
	useSelector: vi.fn( () => [] ),
	useDispatch: vi.fn(),
} ) );

beforeEach( vi.clearAllMocks );

describe( '<GlobalNotices />', () => {
	test( 'should not render without notices', () => {
		const { container } = render( <GlobalNotices /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render notices with the expected structure', () => {
		vi.mocked( useSelector ).mockReturnValue( [
			{
				noticeId: 'testing-notice',
				showDismiss: true,
				status: 'is-success',
				text: 'A test notice',
			},
		] );
		const { container } = render( <GlobalNotices /> );
		expect( container.firstChild ).toHaveClass( 'global-notices' );
		expect( container.firstChild ).toHaveAttribute( 'id', 'overlay-notices' );
		expect( screen.queryAllByRole( 'status' ) ).toHaveLength( 1 );
		expect( container ).toMatchSnapshot();
	} );

	test( 'should use provided id', () => {
		vi.mocked( useSelector ).mockReturnValue( [
			{
				noticeId: 'testing-notice',
				showDismiss: true,
				status: 'is-success',
				text: 'A test notice',
			},
		] );
		const { container } = render( <GlobalNotices id="test-id" /> );
		expect( container.firstChild ).toHaveAttribute( 'id', 'test-id' );
	} );

	test( 'should call dismissals', async () => {
		const notices = [
			{
				noticeId: 'testing-notice',
				onDismissClick: vi.fn(),
				showDismiss: true,
				status: 'is-success',
				text: 'A test notice',
			},
		];
		vi.mocked( useSelector ).mockReturnValue( notices );

		const dispatch = vi.fn();
		vi.mocked( useDispatch ).mockReturnValue( dispatch );

		render( <GlobalNotices id="test-id" /> );

		await userEvent.click( screen.getByRole( 'button' ) );

		expect( notices[ 0 ].onDismissClick ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'NOTICE_REMOVE',
			noticeId: 'testing-notice',
		} );
	} );
} );
