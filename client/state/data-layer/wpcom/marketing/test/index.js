import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { notifyUpgradeNudgeClick, fetchJetpackSaleCouponHandler } from '../';

describe( 'notifyUpgradeNudgeClick', () => {
	test( 'should create an http action in the expected form.', () => {
		const action = {
			siteId: 123,
			nudgeName: 'Profit!',
		};

		expect( notifyUpgradeNudgeClick( action ) ).toEqual(
			http(
				{
					method: 'POST',
					path: `/sites/${ action.siteId }/nudge/click`,
					apiNamespace: 'wpcom/v2',
					body: {
						nudge_name: action.nudgeName,
					},
				},
				action
			)
		);
	} );
} );

describe( 'fetchJetpackSaleCoupon', () => {
	test( 'should create an http action', () => {
		const action = {
			type: 'TEST_ACTION',
		};

		expect( fetchJetpackSaleCouponHandler( action ) ).toEqual(
			http(
				{
					method: 'GET',
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-marketing/sale-coupon',
				},
				action
			)
		);
	} );
} );
