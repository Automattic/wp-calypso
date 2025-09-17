import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';

export const getSeverityLabel = ( severity: number ): string => {
	if ( severity >= 5 ) {
		/** translators: severity label for critical threats */
		return __( 'Critical' );
	}
	if ( severity >= 3 ) {
		/** translators: severity label for high threats */
		return __( 'High' );
	}

	/** translators: severity label for low threats */
	return __( 'Low' );
};

export const getSeverityIntent = ( severity: number ): 'default' | 'error' | 'warning' => {
	if ( severity >= 5 ) {
		return 'error';
	}
	if ( severity >= 3 ) {
		return 'warning';
	}
	return 'default';
};

export const SeverityBadge = ( { severity }: { severity: number } ) => {
	const intent = getSeverityIntent( severity );
	const label = getSeverityLabel( severity );
	return <Badge intent={ intent }>{ label }</Badge>;
};
