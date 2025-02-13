/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector, useDispatch } from 'react-redux';
import GlobalNotices from '..';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn( () => [] ),
	useDispatch: jest.fn(),
} ) );

beforeEach( jest.clearAllMocks );

describe( '<GlobalNotices />', () => {
	test( 'should not render without notices', () => {
		const { container } = render( <GlobalNotices /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render notices with the expected structure', () => {
		jest.mocked( useSelector ).mockReturnValue( [
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
		jest.mocked( useSelector ).mockReturnValue( [
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
				onDismissClick: jest.fn(),
				showDismiss: true,
				status: 'is-success',
				text: 'A test notice',
			},
		];
		jest.mocked( useSelector ).mockReturnValue( notices );

		const dispatch = jest.fn();
		jest.mocked( useDispatch ).mockReturnValue( dispatch );

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
