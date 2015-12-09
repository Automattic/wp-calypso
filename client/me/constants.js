/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

export default {
	sixDigit2faPlaceholder: i18n.translate( 'e.g. 123456', {
		context: '6 digit two factor code placeholder.',
		textOnly: true
	} ),
	sevenDigit2faPlaceholder: i18n.translate( 'e.g. 1234567', {
		context: '7 digit two factor code placeholder.',
		textOnly: true
	} ),
	eightDigitBackupCodePlaceholder: i18n.translate( 'e.g. 12345678', {
		context: '8 digit two factor backup code placeholder.',
		textOnly: true
	} )
};
