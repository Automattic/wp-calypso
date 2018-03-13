/** @format */

/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

export default {
	sixDigit2faPlaceholder: i18n.translate( 'e.g. %(example)s', { args: { example: '123 456' } } ),
	sevenDigit2faPlaceholder: i18n.translate( 'e.g. %(example)s', { args: { example: '1234 567' } } ),
	eightDigitBackupCodePlaceholder: i18n.translate( 'e.g. %(example)s', {
		args: { example: '12345678' },
	} ),
};
