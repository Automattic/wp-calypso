import { getCancellationTopNotice } from '../which-top-notice';

describe( 'getCancellationTopNotice', () => {
	test( 'returns null while the domain-options step is showing', () => {
		expect(
			getCancellationTopNotice( {
				showDomainOptionsStep: true,
				hasRefund: true,
				displayVariant: 'cancel',
			} )
		).toBeNull();
	} );

	test( 'returns time-remaining when there is no refund, for every variant', () => {
		for ( const displayVariant of [ 'cancel', 'remove', 'auto-renew' ] as const ) {
			expect(
				getCancellationTopNotice( {
					showDomainOptionsStep: false,
					hasRefund: false,
					displayVariant,
				} )
			).toBe( 'time-remaining' );
		}
	} );

	test( 'returns refund-eligibility for a refundable cancel (the default param-less path)', () => {
		expect(
			getCancellationTopNotice( {
				showDomainOptionsStep: false,
				hasRefund: true,
				displayVariant: 'cancel',
			} )
		).toBe( 'refund-eligibility' );
	} );

	test( 'returns confirmed for a refundable remove', () => {
		expect(
			getCancellationTopNotice( {
				showDomainOptionsStep: false,
				hasRefund: true,
				displayVariant: 'remove',
			} )
		).toBe( 'confirmed' );
	} );

	test( 'returns time-remaining for a refundable auto-renew variant', () => {
		expect(
			getCancellationTopNotice( {
				showDomainOptionsStep: false,
				hasRefund: true,
				displayVariant: 'auto-renew',
			} )
		).toBe( 'time-remaining' );
	} );
} );
