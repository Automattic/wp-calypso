import { __ } from '@wordpress/i18n';
import { sslStatuses } from 'calypso/lib/domains/constants';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const sslReadableStatus = {
	get ACTIVE() {
		return __( 'SSL certificate active' );
	},
	get PENDING() {
		return __( 'SSL certificate pending' );
	},
	get DISABLED() {
		return __( 'Problem with SSL certificate' );
	},
} as const;

export const isSecuredWithUs = ( { pointsToWpcom, sslStatus }: ResponseDomain ) =>
	pointsToWpcom && sslStatus;

export const getSslReadableStatus = ( { sslStatus }: ResponseDomain ): string => {
	switch ( sslStatus ) {
		case sslStatuses.SSL_ACTIVE:
			return sslReadableStatus.ACTIVE;
		case sslStatuses.SSL_PENDING:
		case sslStatuses.SSL_NEWLY_REGISTERED:
			return sslReadableStatus.PENDING;
		case sslStatuses.SSL_DISABLED:
		default:
			return sslReadableStatus.DISABLED;
	}
};
