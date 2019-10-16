/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export default {
	sixDigit2faPlaceholder: translate( 'e.g. %(example)s', { args: { example: '123456' } } ),
	sevenDigit2faPlaceholder: translate( 'e.g. %(example)s', { args: { example: '1234567' } } ),
	eightDigitBackupCodePlaceholder: translate( 'e.g. %(example)s', {
		args: { example: '12345678' },
	} ),
};
