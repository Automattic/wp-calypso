/**
 * Internal dependencies
 */
import {
	createNotice,
	errorNotice,
	infoNotice,
	plainNotice,
	removeNotice,
	successNotice,
	warningNotice,
} from '../actions';
import { NOTICE_CREATE, NOTICE_REMOVE } from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( 'removeNotice()', () => {
		test( 'should return an action object', () => {
			const action = removeNotice( 123 );

			expect( action ).toEqual( {
				type: NOTICE_REMOVE,
				noticeId: 123,
			} );
		} );
	} );

	describe( 'createNotice()', () => {
		test( 'should use default options when none provided', () => {
			const action = createNotice( 'is-info', 'Notice text' );

			expect( action ).toMatchObject( {
				type: NOTICE_CREATE,
				notice: {
					noticeId: expect.anything(),
					showDismiss: true,
					status: 'is-info',
					text: 'Notice text',
				},
			} );
			expect( action.notice ).toMatchSnapshot();
		} );

		test( 'should return action object with a proper text', () => {
			const text = 'potato';
			const action = createNotice( 'is-success', text );

			expect( action ).toMatchObject( {
				type: NOTICE_CREATE,
				notice: {
					text,
					status: 'is-success',
				},
			} );
		} );

		test( 'should correctly pass received options', () => {
			const id = 'notice-test-id';
			const action = createNotice( 'is-success', 'Notice test text', {
				className: 'test-notice-class',
				duration: 200,
				icon: 'bug',
				id,
				isCompact: true,
				isLoading: true,
				showDismiss: false,
				someFutureNoticeOptionThatIsNotCurrentlyImplemented: 'just works.',
			} );
			expect( action ).toEqual( {
				type: NOTICE_CREATE,
				notice: {
					status: 'is-success',
					text: 'Notice test text',
					className: 'test-notice-class',
					duration: 200,
					icon: 'bug',
					isCompact: true,
					isLoading: true,
					noticeId: id,
					showDismiss: false,
					someFutureNoticeOptionThatIsNotCurrentlyImplemented: 'just works.',
				},
			} );
		} );
	} );

	describe( 'status helpers', () => {
		[
			[ successNotice, 'is-success' ],
			[ errorNotice, 'is-error' ],
			[ infoNotice, 'is-info' ],
			[ warningNotice, 'is-warning' ],
			[ plainNotice, 'is-plain' ],
		].forEach( ( [ helper, status ] ) => {
			test( `${ helper.name } dispatches expected action`, () => {
				const action = helper( 'text' );
				expect( action ).toMatchObject( {
					type: NOTICE_CREATE,
					notice: {
						status,
						text: 'text',
					},
				} );
				expect( action ).toMatchSnapshot();
			} );
		} );
	} );
} );
