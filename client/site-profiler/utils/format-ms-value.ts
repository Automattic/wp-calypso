import { translate } from 'i18n-calypso';

export const formatMsValue = ( msValue: number ): React.ReactElement | string | number => {
	if ( msValue < 1000 ) {
		return translate( '%(value)sms', {
			comment: 'value to be displayed in milliseconds',
			args: { value: Math.floor( msValue ) },
		} );
	}

	return translate( '%(value)ss', {
		comment: 'value to be displayed in seconds',
		args: { value: ( msValue / 1000 ).toFixed( 2 ) },
	} );
};
