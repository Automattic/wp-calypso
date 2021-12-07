import { shallow } from 'enzyme';
import { PendingPayments, requestId } from '../index';

jest.mock( 'calypso/state/data-layer/http-data', () => ( {
	requestHttpData: ( x ) => x,
} ) );

describe( 'PendingPayments requestId', () => {
	test( 'returns the same requestId on multiple calls', () => {
		const example = requestId( '123' );

		expect( requestId( '123' ) ).toEqual( example );
		expect( requestId( 'abc' ) ).not.toEqual( example );
	} );
} );

describe( 'PendingPayments', () => {
	const defaultProps = {
		userId: 1,
		translate: ( x ) => x,
		showErrorNotice: ( x ) => x,
		pendingPayments: [],
		response: {
			state: 'uninitialized',
			error: null,
		},
	};

	describe( 'Loading Placeholder', () => {
		const wrapper = shallow( <PendingPayments { ...defaultProps } /> );

		test( 'PurchasesSite[isPlaceholder=true]', () => {
			expect( wrapper.find( 'PurchasesSite[isPlaceholder=true]' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'Empty placeholder', () => {
		const wrapper = shallow(
			<PendingPayments { ...defaultProps } response={ { state: 'success' } } />
		);

		test( '.pending-payments .pending-payments__no-content EmptyContent', () => {
			expect(
				wrapper.find( '.pending-payments .pending-payments__no-content EmptyContent' )
			).toHaveLength( 1 );
		} );
	} );

	describe( 'Non empty list', () => {
		const pendingPayments = [
			{ orderId: '', siteId: '', productName: '', paymentType: '', totalCostDisplay: '' },
		];
		const wrapper = shallow(
			<PendingPayments
				{ ...defaultProps }
				response={ { state: 'success' } }
				pendingPayments={ pendingPayments }
			/>
		);

		test( 'Main.pending-payments Connect(PendingListItem)', () => {
			expect( wrapper.find( 'Main.pending-payments Connect(PendingListItem)' ) ).toHaveLength( 1 );
		} );
	} );
} );
