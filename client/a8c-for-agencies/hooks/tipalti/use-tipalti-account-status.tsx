import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useGetTipaltiPayee from './use-get-tipalti-payee';

export default function useTipaltiAccountStatus() {
	const translate = useTranslate();
	const tipaltiPayeeQuery = useGetTipaltiPayee();

	const accountStatus = useMemo( () => {
		if ( ! tipaltiPayeeQuery.data ) {
			return null;
		}
		const { Status, IsPayable, PayableReason } = tipaltiPayeeQuery.data;
		switch ( Status ) {
			case 'Active':
				if ( ! IsPayable ) {
					return {
						statusType: 'warning',
						status: translate( 'Not Payable' ),
						statusReason: PayableReason?.map( ( reason: unknown ) => {
							if ( reason === 'No PM' ) {
								return translate( 'Bank details are missing' );
							}
							if ( reason === 'Tax' ) {
								return translate( 'Tax form is missing' );
							}
							return reason;
						} ).join( ', ' ),
					};
				}
				return {
					statusType: 'success',
					status: translate( 'Confirmed' ),
				};
			case 'Suspended':
				return {
					statusType: 'error',
					status: translate( 'Suspended' ),
				};
			case 'Blocked':
				return {
					statusType: 'error',
					status: translate( 'Blocked' ),
					statusReason: translate( 'Your account is blocked' ),
				};
			case 'Closed':
				return {
					statusType: 'error',
					status: translate( 'Closed' ),
					statusReason: translate( 'Your account is closed' ),
				};
			default:
				return null;
		}
	}, [ tipaltiPayeeQuery.data, translate ] );

	return {
		...tipaltiPayeeQuery,
		data: accountStatus,
	};
}
