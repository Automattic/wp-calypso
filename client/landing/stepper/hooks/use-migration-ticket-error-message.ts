import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';

/**
 * The errors wpcom returns when it can't open a migration ticket and trying again won't help, so the
 * customer must not be sent on as if their request reached our team.
 */
export const MIGRATION_TICKET_REFUSED_CODES = [
	'migration_request_not_submitted',
	'too_many_requests',
];

/** What failed migration ticket requests return, including `ticket_creation_failed` from the setup endpoint. */
export const MIGRATION_TICKET_ERROR_CODES = [
	...MIGRATION_TICKET_REFUSED_CODES,
	'internal_error',
	'ticket_creation_failed',
];

export const getErrorCode = ( error: unknown ): string | undefined => {
	const code = ( error as { code?: unknown } | null | undefined )?.code;
	return typeof code === 'string' ? code : undefined;
};

/**
 * Tells the customer what happened to their migration request, and whether to try again.
 */
export const useMigrationTicketErrorMessage = () => {
	const translate = useTranslate();

	return useCallback(
		( error: unknown ): string => {
			switch ( getErrorCode( error ) ) {
				case 'migration_request_not_submitted':
					return translate(
						'We couldn’t submit your migration request automatically. Our team has been notified and will reach out by email.'
					);
				case 'too_many_requests':
					return translate(
						'You’ve already sent us several migration requests today. Our team will follow up by email on the ones we’ve received. If you need to add details, just reply to that email.'
					);
				default:
					return translate(
						'We couldn’t send your migration request just now. Please try again in a few minutes.'
					);
			}
		},
		[ translate ]
	);
};
