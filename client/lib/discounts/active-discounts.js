/** @format */
/**
 * No translate() used in this file since we're launching those promotions just for the EN audience
 */
export default [
	{
		variations: {
			upsell_30: {
				nudgeText: '30% Off All Plans',
				nudgeEndsTodayText: '30% Off (Ends Today)',
				plansPageNoticeText:
					'Enter coupon code “MOTHERSDAY30” during checkout to claim your 30% discount',
			},
			upsell_20: {
				nudgeText: '20% Off All Plans',
				nudgeEndsTodayText: '20% Off (Ends Today)',
				plansPageNoticeText:
					'Enter coupon code “MOTHERSDAY20” during checkout to claim your 30% discount',
			},
		},

		name: 'mothers_day_2018',
		abTestName: 'mothersDay2018Discount',
		startsAt: new Date( 2018, 4, 1, 0, 0, 0 ),
		endsAt: new Date( 2018, 4, 13, 23, 59, 59 ),
	},
];
