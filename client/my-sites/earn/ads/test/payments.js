import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { settings as SETTINGS_FIXTURE } from '../../../../state/selectors/test/fixtures/jetpack-settings';
import paymentsReducer from '../../../../state/wordads/payments/reducer';
import WordAdsPayments from '../payments';
import { wordAdsPaymentsWithValidPayments } from './fixtures/payments-table';

const stateWithoutPayments = {
	ui: {
		selectedSiteId: 999,
	},
	wordads: {
		settings: {
			items: {
				999: {
					paypal: 'example@automattic.com',
				},
			},
		},
	},
	sites: {
		items: {},
	},
	jetpack: {
		settings: SETTINGS_FIXTURE,
	},
};

const stateWithPendingPaymentAndMismatchEmail = {
	...stateWithoutPayments,
	wordads: {
		payments: {
			999: [
				{
					id: 24846,
					paymentDate: '2022-01-15',
					amount: '30',
					status: 'pending',
					paypalEmail: 'example@automattic.com',
					description: 'Pending for some reason',
				},
			],
		},
		settings: {
			items: {
				999: {
					paypal: 'mismatch_example@automattic.com',
				},
			},
		},
	},
};

const stateWithValidPayments = {
	...stateWithoutPayments,
	wordads: {
		...stateWithoutPayments.wordads,
		payments: {
			999: [
				{
					id: 1,
					paymentDate: '2022-01-15',
					amount: '100',
					status: 'paid',
					paypalEmail: 'example@automattic.com',
					description: '',
				},
				{
					id: 2,
					paymentDate: '2022-02-15',
					amount: '1.50',
					status: 'failed',
					paypalEmail: 'example@automattic.com',
					description: 'Failed for some reason',
				},
				{
					id: 3,
					paymentDate: '2022-03-15',
					amount: '100',
					status: 'pending',
					paypalEmail: 'example@automattic.com',
					description: 'Pending for some reason',
				},
			],
		},
	},
};

test( 'Empty payments list should show a notice', () => {
	const store = createStore( paymentsReducer, stateWithoutPayments );
	const wordAdsPayments = shallow(
		<Provider store={ store }>
			<WordAdsPayments />
		</Provider>
	);
	expect( wordAdsPayments.html() ).to.contain(
		'You have no payments history. Payment will be made as soon as the total outstanding amount has reached $100.'
	);
} );

test( 'Pending payment with email not equals Paypal email configured on settings should show a notice', () => {
	const store = createStore( paymentsReducer, stateWithPendingPaymentAndMismatchEmail );
	const wordAdsPayments = shallow(
		<Provider store={ store }>
			<WordAdsPayments />
		</Provider>
	);
	expect( wordAdsPayments.html() ).to.contain(
		'Your pending payment will be sent to a PayPal address different from your current address.'
	);
} );

test( 'Payments table should show as expected', () => {
	const store = createStore( paymentsReducer, stateWithValidPayments );
	const wordAdsPayments = shallow(
		<Provider store={ store }>
			<WordAdsPayments />
		</Provider>
	);
	expect( normalizeOutput( wordAdsPayments.html() ) ).equals(
		normalizeOutput( wordAdsPaymentsWithValidPayments )
	);
} );

function normalizeOutput( output ) {
	return output.replace( /\s/g, '' );
}
