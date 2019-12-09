/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

export default {
	sixDigit2faPlaceholder: i18n.translate( 'e.g. %(example)s', { args: { example: '123456' } } ),
	sevenDigit2faPlaceholder: i18n.translate( 'e.g. %(example)s', { args: { example: '1234567' } } ),
	eightDigitBackupCodePlaceholder: i18n.translate( 'e.g. %(example)s', {
		args: { example: '12345678' },
	} ),
	CONCIERGE_HAS_UPCOMING_APPOINTMENT: 'has-upcoming-appointment',
	CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION: 'has-available-included-session',
	CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION: 'has-available-purchased-session',
	CONCIERGE_SUGGEST_PURCHASE_CONCIERGE: 'suggest-purchase-concierge',
};
