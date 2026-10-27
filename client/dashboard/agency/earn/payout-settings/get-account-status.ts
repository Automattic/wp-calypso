import { __ } from '@wordpress/i18n';
import type { TipaltiPayee } from '@automattic/api-core';
import type { Badge } from '@wordpress/ui';
import type { ComponentProps } from 'react';

interface AccountStatus {
	statusType: 'success' | 'warning' | 'error';
	badgeIntent: NonNullable< ComponentProps< typeof Badge >[ 'intent' ] >;
	status: string;
	statusReason?: string;
	actionRequired: boolean;
}

// One sentence per combination, so the reason reads as an instruction rather than a list.
function getNotPayableReason( reasons: string[] = [] ) {
	const isBankDetailsMissing = reasons.includes( 'No PM' );
	const isTaxFormMissing = reasons.includes( 'Tax' );

	if ( isBankDetailsMissing && isTaxFormMissing ) {
		return __( 'Add your tax form and bank details in Tipalti to get paid.' );
	}
	if ( isTaxFormMissing ) {
		return __( 'Add your tax form in Tipalti to get paid.' );
	}
	if ( isBankDetailsMissing ) {
		return __( 'Add your bank details in Tipalti to get paid.' );
	}
	return __( 'Complete your details in Tipalti to get paid.' );
}

export function getAccountStatus( data: TipaltiPayee | null | undefined ): AccountStatus | null {
	if ( ! data ) {
		return null;
	}
	const { Status, IsPayable, PayableReason } = data;
	let statusMeta: Pick< AccountStatus, 'statusType' | 'status' | 'statusReason' > | null = null;
	switch ( Status ) {
		case 'Active':
			if ( ! IsPayable ) {
				statusMeta = {
					statusType: 'warning',
					status: __( 'Not Payable' ),
					statusReason: getNotPayableReason( PayableReason ),
				};
				break;
			}
			statusMeta = {
				statusType: 'success',
				status: __( 'Confirmed' ),
			};
			break;
		case 'Suspended':
			statusMeta = {
				statusType: 'error',
				status: __( 'Suspended' ),
			};
			break;
		case 'Blocked':
			statusMeta = {
				statusType: 'error',
				status: __( 'Blocked' ),
				statusReason: __( 'Your account is blocked.' ),
			};
			break;
		case 'Closed':
			statusMeta = {
				statusType: 'error',
				status: __( 'Closed' ),
				statusReason: __( 'Your account is closed.' ),
			};
			break;
		default:
			break;
	}

	if ( ! statusMeta ) {
		return null;
	}

	const badgeIntents: Record< AccountStatus[ 'statusType' ], AccountStatus[ 'badgeIntent' ] > = {
		success: 'stable',
		warning: 'medium',
		error: 'high',
	};

	return {
		...statusMeta,
		badgeIntent: badgeIntents[ statusMeta.statusType ],
		actionRequired: [ 'warning', 'error' ].includes( statusMeta.statusType ),
	};
}
